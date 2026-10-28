import { Logger } from "@trading-plateform/utils";
import { createKafkaEvent } from "@trading-plateform/kafka";
import {
    BACKTEST_TOPICS,
    type BacktestCompletedPayload,
    type BacktestFailedPayload,
    type BacktestRequestedPayload,
    type BacktestStartedPayload,
} from "@trading-plateform/contracts";
import { ACTIVE_STATUSES } from "../constants/backtest.constants";
import ConflictError from "../errors/conflict.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalError from "../errors/internal.error";
import NotFoundError from "../errors/notfound.error";
import { producer } from "../lib/kafka";
import BacktestRepository, { type IBacktestRepository } from "../repositories/backtest.repository";
import type { Backtest } from "../generated/prisma/client";
import type { CreateBacktestInput } from "../interfaces/backtest.interface";

const logger = Logger.here()

class BacktestService {
    repo: IBacktestRepository = new BacktestRepository()

    async create(userId: string, input: CreateBacktestInput) {
        logger.info("Creating backtest", { userId, name: input.name })
        const isDca = input.strategy === "dca"
        const backtest = await this.repo.create({
            userId,
            name: input.name,
            symbols: input.symbols,
            startDate: input.start,
            endDate: input.end,
            investmentMode: isDca ? "RECURRING" : "LUMP_SUM",
            initialAmount: isDca ? 0 : input.amount,
            recurringAmount: isDca ? input.amount : null,
            investmentFrequency: isDca ? "MONTHLY" : null,
            feeRate: input.fee / 100,
        })
        logger.info("Backtest created", { id: backtest.id, userId })
        await this.requestExecution(backtest, backtest.executions[0]!.id)
        return backtest
    }

    async rerun(id: string, userId: string) {
        logger.info("Rerunning backtest", { id, userId })
        const backtest = this.assertOwner(await this.repo.getById(id), userId)
        const latest = backtest.executions[0]
        if (latest && ACTIVE_STATUSES.includes(latest.status)) {
            throw new ConflictError("An execution is already in progress", { executionId: latest.id })
        }
        const attempt = (latest?.attempt ?? 0) + 1
        const execution = await this.repo.createExecution(id, attempt)
        logger.info("Backtest execution created", { id, executionId: execution.id, attempt })
        await this.requestExecution(backtest, execution.id)
        return execution
    }

    async getById(id: string, userId: string) {
        logger.info("Fetching backtest", { id, userId })
        return this.assertOwner(await this.repo.getDetailsById(id), userId)
    }

    async getAll(userId: string) {
        logger.info("Fetching all backtests", { userId })
        const result = await this.repo.getAllByUserId(userId)
        logger.info("Backtests fetched", { userId, count: result.count })
        return result
    }

    // Transitions gardées : un événement rejoué ou arrivé trop tard est ignoré (Kafka at-least-once)
    async markRunning({ executionId, startedAt }: BacktestStartedPayload) {
        const updated = await this.repo.updateExecution(executionId, ["PENDING"], {
            status: "RUNNING",
            startedAt: new Date(startedAt),
        })
        logger.info(updated ? "Backtest execution running" : "Backtest started event ignored", { executionId })
    }

    async complete({ executionId, finishedAt, maxDrawdownDate, ...result }: BacktestCompletedPayload) {
        const updated = await this.repo.completeExecution(executionId, ACTIVE_STATUSES, {
            finishedAt: new Date(finishedAt),
            maxDrawdownDate: maxDrawdownDate ? new Date(maxDrawdownDate) : null,
            ...result,
        })
        logger.info(updated ? "Backtest execution completed" : "Backtest completed event ignored", { executionId })
    }

    async fail({ executionId, finishedAt, error }: BacktestFailedPayload) {
        const updated = await this.repo.updateExecution(executionId, ACTIVE_STATUSES, {
            status: "FAILED",
            finishedAt: new Date(finishedAt),
            error,
        })
        logger.info(updated ? "Backtest execution failed" : "Backtest failed event ignored", { executionId, error })
    }

    private assertOwner<T extends Backtest>(backtest: T | null, userId: string): T {
        if (!backtest) throw new NotFoundError("Backtest not found")
        if (backtest.userId !== userId) throw new ForbiddenError("Access denied")
        return backtest
    }

    private async requestExecution(backtest: Backtest, executionId: string) {
        const payload: BacktestRequestedPayload = {
            executionId,
            backtestId: backtest.id,
            userId: backtest.userId,
            symbols: backtest.symbols,
            startDate: backtest.startDate.toISOString(),
            endDate: backtest.endDate.toISOString(),
            investmentMode: backtest.investmentMode,
            initialAmount: backtest.initialAmount.toNumber(),
            recurringAmount: backtest.recurringAmount?.toNumber() ?? null,
            investmentFrequency: backtest.investmentFrequency,
            feeRate: backtest.feeRate.toNumber(),
        }
        try {
            await producer.publish(BACKTEST_TOPICS.requested, {
                key: executionId,
                value: createKafkaEvent(BACKTEST_TOPICS.requested, payload),
            })
            logger.info("Backtest execution requested", { executionId })
        } catch (error) {
            logger.error("Failed to publish backtest request", { executionId, error })
            await this.repo.updateExecution(executionId, ["PENDING"], {
                status: "FAILED",
                finishedAt: new Date(),
                error: "Backtest could not be queued",
            })
            throw new InternalError("Backtest could not be queued")
        }
    }
}

export default BacktestService
