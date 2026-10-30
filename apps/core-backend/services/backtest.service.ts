import { Logger } from "@trading-plateform/utils";
import { createKafkaEvent } from "@trading-plateform/kafka";
import {
    BACKTEST_TOPICS,
    type Allocation,
    type BacktestCompletedPayload,
    type BacktestFailedPayload,
    type BacktestRequestedPayload,
    type BacktestStartedPayload,
    type BacktestStats,
    type Paginated,
} from "@trading-plateform/contracts";
import { ACTIVE_STATUSES } from "../constants/backtest.constants";
import ConflictError from "../errors/conflict.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalError from "../errors/internal.error";
import NotFoundError from "../errors/notfound.error";
import { producer } from "../lib/kafka";
import BacktestRepository, { type IBacktestRepository } from "../repositories/backtest.repository";
import type { Backtest, BacktestStatus } from "../generated/prisma/client";
import type { BacktestListQuery, BacktestWithExecutions, CreateBacktestInput } from "../interfaces/backtest.interface";

const logger = Logger.here()

/**
 * Répartit les symboles à parts égales au pourcent entier (D2) : `floor(100 / n)` % chacun,
 * le reste ajouté 1 % par 1 % aux premiers symboles, pour une somme exactement égale à 1.
 */
function equalWeightAllocations(symbols: string[]): Allocation[] {
    const base = Math.floor(100 / symbols.length)
    const remainder = 100 - base * symbols.length
    return symbols.map((symbol, index) => ({ symbol, weight: (base + (index < remainder ? 1 : 0)) / 100 }))
}

class BacktestService {
    repo: IBacktestRepository = new BacktestRepository()

    /**
     * Crée un backtest à partir du formulaire (stratégie `dca` = versement mensuel de `amount`, `lump_sum` = versement unique ;
     * `fee` en pourcentage stocké en fraction), avec sa première exécution `PENDING`, puis publie `backtest.requested`.
     */
    async create(userId: string, input: CreateBacktestInput) {
        logger.info("Creating backtest", { userId, name: input.name })
        const isDca = input.strategy === "dca"
        const backtest = await this.repo.create({
            userId,
            name: input.name,
            allocations: { create: equalWeightAllocations(input.symbols) },
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

    /**
     * Relance un backtest : nouvelle exécution (`attempt` + 1) et publication de `backtest.requested`.
     * Lève `NotFoundError`/`ForbiddenError` si l'utilisateur n'en est pas propriétaire, `ConflictError` si une exécution est active.
     */
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

    async getAll(userId: string, { status, ...pagination }: BacktestListQuery): Promise<Paginated<BacktestWithExecutions>> {
        logger.info("Fetching all backtests", { userId, ...pagination, status })
        const result = await this.repo.getAllByUserId(userId, pagination, status)
        logger.info("Backtests fetched", { userId, count: result.count })
        return { ...result, ...pagination }
    }

    /** Compteurs des backtests de l'utilisateur selon le statut de leur dernière exécution ; taux en fraction du total (0 sans backtest). */
    async getStats(userId: string): Promise<BacktestStats> {
        logger.info("Fetching backtest stats", { userId })
        const { total, byStatus } = await this.repo.countByLatestStatus(userId)
        const sum = (statuses: BacktestStatus[]) => byStatus
            .filter(({ status }) => statuses.includes(status))
            .reduce((n, { count }) => n + count, 0)
        const completed = sum(["COMPLETED"])
        const failed = sum(["FAILED"])
        const rate = (n: number) => (total ? n / total : 0)
        return {
            total,
            active: sum(ACTIVE_STATUSES),
            completed,
            failed,
            completedRate: rate(completed),
            failedRate: rate(failed),
        }
    }

    // Transitions gardées : un événement rejoué ou arrivé trop tard est ignoré (Kafka at-least-once)
    /** `backtest.started` : `PENDING` → `RUNNING`. */
    async markRunning({ executionId, startedAt }: BacktestStartedPayload) {
        const updated = await this.repo.updateExecution(executionId, ["PENDING"], {
            status: "RUNNING",
            startedAt: new Date(startedAt),
        })
        logger.info(updated ? "Backtest execution running" : "Backtest started event ignored", { executionId })
    }

    /** `backtest.completed` : exécution active → `COMPLETED` et enregistrement du résultat, dans une transaction. */
    async complete({ executionId, finishedAt, maxDrawdownDate, ...result }: BacktestCompletedPayload) {
        const updated = await this.repo.completeExecution(executionId, ACTIVE_STATUSES, {
            finishedAt: new Date(finishedAt),
            maxDrawdownDate: maxDrawdownDate ? new Date(maxDrawdownDate) : null,
            ...result,
        })
        logger.info(updated ? "Backtest execution completed" : "Backtest completed event ignored", { executionId })
    }

    /** `backtest.failed` : exécution active → `FAILED` avec sa cause. */
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

    private async requestExecution(backtest: BacktestWithExecutions, executionId: string) {
        const payload: BacktestRequestedPayload = {
            executionId,
            backtestId: backtest.id,
            userId: backtest.userId,
            allocations: backtest.allocations.map(({ symbol, weight }) => ({ symbol, weight: weight.toNumber() })),
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
