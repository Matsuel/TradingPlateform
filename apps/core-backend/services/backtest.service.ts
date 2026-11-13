import { randomUUID } from "node:crypto";
import { estimateSchedule, Logger } from "@trading-plateform/utils";
import { createKafkaEvent } from "@trading-plateform/kafka";
import {
    API_ERROR_CODES,
    BACKTEST_TOPICS,
    BATCH_SUMMARY_WINDOW_YEARS,
    COMPARED_METRICS,
    COMPARISON_PARAMETERS,
    PRICE_DATA_SOURCE,
    type BacktestCompletedPayload,
    type BacktestFailedPayload,
    type BacktestPreview,
    type BacktestRequestedPayload,
    type BacktestStartedPayload,
    type BacktestStats,
    type ComparedMetric,
    type ComparisonParameter,
    type Paginated,
} from "@trading-plateform/contracts";
import { ACTIVE_STATUSES, COMPARABLE_STATUSES, EXECUTION_TIMEOUT_MS } from "../constants/backtest.constants";
import { BadRequestError, ConflictError, ForbiddenError, InternalError, NotFoundError } from "@trading-plateform/http";
import { producer } from "../lib/kafka";
import BacktestRepository, { type IBacktestRepository } from "../repositories/backtest.repository";
import type { Backtest, BacktestStatus, Prisma } from "../generated/prisma/client";
import { latestBatchStart } from "../interfaces/backtest.interface";
import type {
    BacktestCompareQuery,
    BacktestComparisonDTO,
    BatchStartDatesInput,
    BacktestBatchDTO,
    BacktestListQuery,
    BacktestWithExecutions,
    BatchBacktestRecord,
    BatchRecords,
    ComparedBacktestDTO,
    ComparedBacktestRecord,
    CreateBacktestInput,
    CreateBatchInput,
} from "../interfaces/backtest.interface";

const logger = Logger.here()

/** Remonte le résultat de la dernière exécution `COMPLETED` ; `NotFoundError` si le backtest ou son résultat a disparu entre les deux lectures. */
const toCompared = (record: ComparedBacktestRecord | undefined): ComparedBacktestDTO => {
    const result = record?.executions[0]?.result
    if (!record || !result) throw new NotFoundError(API_ERROR_CODES.BACKTEST_NOT_FOUND)
    const { executions, ...backtest } = record
    return { ...backtest, result }
}

/** Statut d'un lot : échoué dès qu'un départ l'est, terminé quand tous le sont, sinon en cours (`RUNNING` si l'un tourne). */
const batchStatus = (statuses: BacktestStatus[]): BacktestStatus => {
    if (statuses.includes("FAILED")) return "FAILED"
    if (statuses.every((status) => status === "COMPLETED")) return "COMPLETED"
    return statuses.includes("RUNNING") || statuses.includes("COMPLETED") ? "RUNNING" : "PENDING"
}

/** Médiane d'une liste non vide, moyenne des deux valeurs centrales si le nombre est pair. */
const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = sorted.length >> 1
    return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

// Écart A − B en points de ratio (Sharpe sans unité), comme benchmark.excess* ; null si l'une des deux valeurs manque
const delta = (a: Prisma.Decimal | null, b: Prisma.Decimal | null) => (a && b ? a.minus(b).toNumber() : null)

/** Lignes, statut, synthèse (CAGR médian, pire départ, pire fenêtre) et fenêtres glissantes d'un lot, à partir de ses départs. */
const summarizeBatch = (backtests: BatchBacktestRecord[], rollingSummary: BatchRecords["rollingSummary"]): Omit<BacktestBatchDTO, "batchId" | "name" | "endDate"> => {
    const statuses = backtests.map(({ latestExecution }) => latestExecution?.status ?? "PENDING")
    const cagrs = backtests.map(({ executions }) => executions[0]?.result?.cagr?.toNumber() ?? null)
    const allDone = statuses.every((status) => status === "COMPLETED") && cagrs.every((cagr) => cagr !== null)
    const done = cagrs.filter((cagr): cagr is number => cagr !== null)
    const [worst, best] = [Math.min(...done), Math.max(...done)]
    const windows = backtests[0]?.executions[0]?.result ? rollingSummary : null
    const window = windows?.find(({ years }) => years === BATCH_SUMMARY_WINDOW_YEARS)
    const worstIndex = cagrs.indexOf(worst)

    return {
        status: batchStatus(statuses),
        rows: backtests.map(({ id, startDate, executions }, i) => {
            const result = executions[0]?.result
            return {
                backtestId: id,
                startDate,
                status: statuses[i]!,
                result: result ? { finalValue: result.finalValue, cagr: result.cagr, volatility: result.volatility, sharpeRatio: result.sharpeRatio, maxDrawdown: result.maxDrawdown, totalReturn: result.totalReturn } : null,
                rank: allDone && worst !== best ? (cagrs[i] === best ? "BEST" : cagrs[i] === worst ? "WORST" : null) : null,
            }
        }),
        summary: done.length
            ? {
                  medianCagr: median(done),
                  cagrSpread: done.length > 1 ? best - worst : null,
                  worstStart: { startDate: backtests[worstIndex]!.startDate.toISOString(), cagr: worst },
                  window: window ? { years: window.years, worst: window.worst, worstDate: window.worstDate, negativeShare: window.negativeShare, count: window.count } : null,
              }
            : null,
        rollingSummary: windows ?? null,
    }
}

class BacktestService {
    repo: IBacktestRepository = new BacktestRepository()

    /**
     * Crée un backtest à partir du formulaire (allocation déjà convertie en ratios par le schéma ; `RECURRING` = versement
     * mensuel de `recurringAmount` après `initialAmount` ; `fee` en pourcentage stocké en fraction), avec sa première
     * exécution `PENDING`, puis publie `backtest.requested`. `batchId` rattache le backtest à un lot (voir `createBatch`).
     */
    async create(userId: string, input: CreateBacktestInput, batchId?: string) {
        logger.info("Creating backtest", { userId, name: input.name })
        const backtest = await this.repo.create({
            userId,
            batchId,
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
            benchmarkSymbol: input.benchmarkSymbol ?? null,
        })
        logger.info("Backtest created", { id: backtest.id, userId })
        await this.requestExecution(backtest, backtest.executions[0]!.id)
        return backtest
    }

    /**
     * Crée un lot (D1) : un backtest par date de `startDates`, par ordre chronologique, tous liés par le même `batchId` et
     * portant le même nom. Chaque départ a sa première exécution et son `backtest.requested`.
     */
    async createBatch(userId: string, { startDates, ...input }: CreateBatchInput) {
        const batchId = randomUUID()
        logger.info("Creating backtest batch", { userId, batchId, count: startDates.length })
        const backtests: BacktestWithExecutions[] = []
        for (const start of [...startDates].sort((a, b) => a.getTime() - b.getTime())) {
            backtests.push(await this.create(userId, { ...input, start }, batchId))
        }
        return { batchId, backtests }
    }

    /**
     * Départs d'un lot, du plus ancien au plus récent, avec les métriques de leur dernier résultat terminé (`null` tant qu'il
     * n'existe pas), le statut du lot, la synthèse (CAGR médian, pire départ, pire fenêtre) et les fenêtres glissantes du départ
     * le plus ancien. Meilleur et pire départ ne sont désignés qu'une fois tout le lot terminé. Lève `NotFoundError` si le lot
     * n'existe pas, `ForbiddenError` s'il appartient à un autre utilisateur.
     */
    async getBatch(batchId: string, userId: string): Promise<BacktestBatchDTO> {
        logger.info("Fetching backtest batch", { batchId, userId })
        const { backtests, rollingSummary } = await this.repo.getBatch(batchId)
        const first = this.assertOwner(backtests[0] ?? null, userId)
        return {
            batchId,
            name: first.name,
            endDate: first.endDate,
            ...summarizeBatch(backtests, rollingSummary),
        }
    }

    /**
     * Relance la stratégie d'un lot à de nouvelles dates (`startDates`, mêmes règles qu'à la création, fin commune du lot) :
     * crée un nouveau lot, l'ancien reste intact. Lève `NotFoundError`/`ForbiddenError` comme `getBatch`, `BadRequestError`
     * (`START_TOO_CLOSE_TO_END`) si un départ est à moins d'un an de la fin.
     */
    async restartBatch(batchId: string, userId: string, { startDates }: BatchStartDatesInput) {
        logger.info("Restarting backtest batch", { batchId, userId })
        const { backtests } = await this.repo.getBatch(batchId)
        const first = this.assertOwner(backtests[0] ? await this.repo.getById(backtests[0].id) : null, userId)
        if (startDates.some((start) => start > latestBatchStart(first.endDate))) {
            throw new BadRequestError(API_ERROR_CODES.START_TOO_CLOSE_TO_END)
        }
        return this.createBatch(userId, {
            name: first.name,
            investmentMode: first.investmentMode,
            allocations: first.allocations.map(({ symbol, weight }) => ({ symbol, weight: weight.toNumber() })),
            end: first.endDate,
            initialAmount: first.initialAmount.toNumber(),
            recurringAmount: first.recurringAmount?.toNumber(),
            rebalanceFrequency: first.rebalanceFrequency,
            fee: first.feeRate.times(100).toNumber(),
            benchmarkSymbol: first.benchmarkSymbol,
            startDates,
        })
    }

    /**
     * Relance un lot : une nouvelle exécution de chaque départ. Lève `NotFoundError`/`ForbiddenError` comme `getBatch`,
     * `ConflictError` si un départ a une exécution active (rien n'est relancé).
     */
    async rerunBatch(batchId: string, userId: string) {
        logger.info("Rerunning backtest batch", { batchId, userId })
        const { backtests } = await this.repo.getBatch(batchId)
        this.assertOwner(backtests[0] ?? null, userId)
        if (backtests.some(({ latestExecution }) => latestExecution && ACTIVE_STATUSES.includes(latestExecution.status))) {
            throw new ConflictError(API_ERROR_CODES.EXECUTION_IN_PROGRESS)
        }
        const executions = []
        for (const { id } of backtests) executions.push(await this.rerun(id, userId))
        return executions
    }

    /**
     * Prévisualise un backtest sans l'écrire ni appeler l'engine : versements et rebalancements prévus sur les jours ouvrés
     * de la période (règles de l'engine : versement le premier jour puis, en `RECURRING`, au premier jour de chaque mois ;
     * rebalancement au premier jour de chaque période, hors premier jour) et source des cours. Estimations calendaires :
     * jours fériés et premier cours commun des symboles inconnus avant l'exécution.
     */
    preview(userId: string, input: CreateBacktestInput): BacktestPreview {
        logger.info("Previewing backtest", { userId })
        return { ...estimateSchedule(input.start, input.end, input.investmentMode, input.rebalanceFrequency), dataSource: PRICE_DATA_SOURCE }
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
            throw new ConflictError(API_ERROR_CODES.EXECUTION_IN_PROGRESS, { executionId: latest.id })
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

    async getAll(userId: string, { status, hasResult, ...pagination }: BacktestListQuery): Promise<Paginated<BacktestWithExecutions>> {
        logger.info("Fetching all backtests", { userId, ...pagination, status, hasResult })
        // Comparables : au moins une exécution au statut comparable, même relancés depuis
        const result = await this.repo.getAllByUserId(userId, pagination, { status, executionStatus: hasResult ? COMPARABLE_STATUSES : undefined })
        logger.info("Backtests fetched", { userId, count: result.count })
        return { ...result, ...pagination }
    }

    /**
     * Compare deux backtests de l'utilisateur sur le résultat de leur dernière exécution `COMPLETED` : écarts A − B des
     * métriques et homogénéité (même période, mêmes frais, même benchmark). Lève `NotFoundError` si un backtest n'existe pas
     * ou appartient à un autre utilisateur (son existence n'est pas révélée), `BadRequestError` s'il n'a aucun résultat terminé.
     */
    async compare(userId: string, { ids }: BacktestCompareQuery): Promise<BacktestComparisonDTO> {
        logger.info("Comparing backtests", { userId, ids })
        const counts = await this.repo.countExecutionsByIds(ids, userId, COMPARABLE_STATUSES)
        for (const id of ids) {
            const backtest = counts.find((count) => count.id === id)
            if (!backtest) throw new NotFoundError(API_ERROR_CODES.BACKTEST_NOT_FOUND, { id })
            if (backtest._count.executions === 0) throw new BadRequestError(API_ERROR_CODES.BACKTEST_NO_RESULT, { id })
        }
        const records = await this.repo.getComparedByIds(ids, COMPARABLE_STATUSES)
        const [a, b] = ids.map((id) => toCompared(records.find((record) => record.id === id))) as [ComparedBacktestDTO, ComparedBacktestDTO]
        const deltas = Object.fromEntries(
            COMPARED_METRICS.map((metric) => [metric, delta(a.result[metric], b.result[metric])]),
        ) as Record<ComparedMetric, number | null>
        const differs: Record<ComparisonParameter, boolean> = {
            period: a.startDate.getTime() !== b.startDate.getTime() || a.endDate.getTime() !== b.endDate.getTime(),
            feeRate: !a.feeRate.equals(b.feeRate),
            benchmarkSymbol: a.benchmarkSymbol !== b.benchmarkSymbol,
        }
        const differences = COMPARISON_PARAMETERS.filter((parameter) => differs[parameter])
        return { a, b, deltas, homogeneous: differences.length === 0, differences }
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
    async fail({ executionId, finishedAt, error, errorCode }: BacktestFailedPayload) {
        const updated = await this.repo.updateExecution(executionId, ACTIVE_STATUSES, {
            status: "FAILED",
            finishedAt: new Date(finishedAt),
            error,
            errorCode,
        })
        logger.info(updated ? "Backtest execution failed" : "Backtest failed event ignored", { executionId, error })
    }

    /**
     * Passe en `FAILED` (`EXECUTION_TIMEOUT`) les exécutions actives créées il y a plus de `EXECUTION_TIMEOUT_MS` : sans cela
     * un engine tombé laisse le backtest bloqué et chaque relance répond `409`. Un résultat tardif est ensuite ignoré
     * (transitions gardées par statut). Renvoie le nombre d'exécutions expirées.
     */
    async failStaleExecutions(): Promise<number> {
        const now = new Date()
        const count = await this.repo.failStaleExecutions(ACTIVE_STATUSES, new Date(now.getTime() - EXECUTION_TIMEOUT_MS), {
            status: "FAILED",
            finishedAt: now,
            error: "Execution timed out",
            errorCode: "EXECUTION_TIMEOUT",
        })
        if (count > 0) logger.warn("Stale executions failed", { count })
        return count
    }

    private assertOwner<T extends Pick<Backtest, "userId">>(backtest: T | null, userId: string): T {
        if (!backtest) throw new NotFoundError(API_ERROR_CODES.BACKTEST_NOT_FOUND)
        if (backtest.userId !== userId) throw new ForbiddenError()
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
            benchmarkSymbol: backtest.benchmarkSymbol,
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
            throw new InternalError(API_ERROR_CODES.BACKTEST_QUEUE_FAILED)
        }
    }
}

export default BacktestService
