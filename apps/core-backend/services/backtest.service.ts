import { Logger } from "@trading-plateform/utils";
import { createKafkaEvent } from "@trading-plateform/kafka";
import {
    BACKTEST_TOPICS,
    PRICE_DATA_SOURCE,
    type BacktestCompletedPayload,
    type BacktestFailedPayload,
    type BacktestPreview,
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

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Jours ouvrés (lundi–vendredi, `YYYY-MM-DD`) de `start` inclus à `end` exclu, comme l'intervalle de cours demandé
 * par l'engine. Les dates du formulaire sont un minuit local sérialisé en UTC : l'arrondi au minuit UTC le plus proche
 * retrouve le jour saisi pour tout fuseau à ±12 h. Jours fériés inconnus avant le chargement des cours : estimation.
 */
const businessDays = (start: Date, end: Date) => {
    const days: string[] = []
    for (let day = Math.round(start.getTime() / DAY_MS); day < Math.round(end.getTime() / DAY_MS); day++) {
        const date = new Date(day * DAY_MS)
        const weekday = date.getUTCDay()
        if (weekday !== 0 && weekday !== 6) days.push(date.toISOString().slice(0, 10))
    }
    return days
}

// Clé de période d'un jour `YYYY-MM-DD` : même règle que `periodKey` de backtest-engine/engine/backtest.utils.ts,
// recopiée car une app n'importe pas une autre ; à garder alignée si l'engine change ses périodes
const periodKey = (date: string, frequency: Exclude<CreateBacktestInput["rebalanceFrequency"], "NONE">) => {
    switch (frequency) {
        case "MONTHLY":
            return date.slice(0, 7)
        case "QUARTERLY":
            return `${date.slice(0, 4)}-Q${Math.ceil(Number(date.slice(5, 7)) / 3)}`
        case "YEARLY":
            return date.slice(0, 4)
    }
}

/** Nombre de périodes distinctes rencontrées dans `days` (triés) : chacune commence à son premier jour. */
const countPeriods = (days: string[], frequency: Parameters<typeof periodKey>[1]) =>
    new Set(days.map((day) => periodKey(day, frequency))).size

class BacktestService {
    repo: IBacktestRepository = new BacktestRepository()

    /**
     * Crée un backtest à partir du formulaire (allocation déjà convertie en ratios par le schéma ; `RECURRING` = versement
     * mensuel de `recurringAmount` après `initialAmount` ; `fee` en pourcentage stocké en fraction), avec sa première
     * exécution `PENDING`, puis publie `backtest.requested`.
     */
    async create(userId: string, input: CreateBacktestInput) {
        logger.info("Creating backtest", { userId, name: input.name })
        const backtest = await this.repo.create({
            userId,
            name: input.name,
            allocations: { create: input.allocations },
            startDate: input.start,
            endDate: input.end,
            investmentMode: input.investmentMode,
            initialAmount: input.initialAmount,
            recurringAmount: input.recurringAmount ?? null,
            investmentFrequency: input.investmentMode === "RECURRING" ? "MONTHLY" : null,
            rebalanceFrequency: input.rebalanceFrequency,
            feeRate: input.fee / 100,
        })
        logger.info("Backtest created", { id: backtest.id, userId })
        await this.requestExecution(backtest, backtest.executions[0]!.id)
        return backtest
    }

    /**
     * Prévisualise un backtest sans l'écrire ni appeler l'engine : versements et rebalancements prévus sur les jours ouvrés
     * de la période (règles de l'engine : versement le premier jour puis, en `RECURRING`, au premier jour de chaque mois ;
     * rebalancement au premier jour de chaque période, hors premier jour) et source des cours. Estimations calendaires :
     * jours fériés et premier cours commun des symboles inconnus avant l'exécution.
     */
    preview(userId: string, input: CreateBacktestInput): BacktestPreview {
        logger.info("Previewing backtest", { userId })
        const days = businessDays(input.start, input.end)
        const contributionCount = input.investmentMode === "RECURRING" ? countPeriods(days, "MONTHLY") : Math.min(days.length, 1)
        const rebalanceCount = input.rebalanceFrequency === "NONE" ? 0 : Math.max(countPeriods(days, input.rebalanceFrequency) - 1, 0)
        return { contributionCount, rebalanceCount, dataSource: PRICE_DATA_SOURCE }
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
    async complete({
        executionId,
        finishedAt,
        maxDrawdownDate,
        maxDrawdownPeakDate,
        maxDrawdownRecoveryDate,
        // Benchmark pas encore stocké (colonne ajoutée par T-23) : écarté pour que Prisma ne rejette pas l'écriture
        benchmark: _benchmark,
        ...result
    }: BacktestCompletedPayload) {
        const updated = await this.repo.completeExecution(executionId, ACTIVE_STATUSES, {
            finishedAt: new Date(finishedAt),
            maxDrawdownDate: maxDrawdownDate ? new Date(maxDrawdownDate) : null,
            maxDrawdownPeakDate: maxDrawdownPeakDate ? new Date(maxDrawdownPeakDate) : null,
            maxDrawdownRecoveryDate: maxDrawdownRecoveryDate ? new Date(maxDrawdownRecoveryDate) : null,
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
            rebalanceFrequency: backtest.rebalanceFrequency,
            feeRate: backtest.feeRate.toNumber(),
            // Pas encore stocké : colonne Backtest.benchmarkSymbol ajoutée par T-23
            benchmarkSymbol: null,
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
