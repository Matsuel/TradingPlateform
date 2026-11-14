import type { Paginated } from "@azimut/contracts"
import { apiFetch } from "@/lib/api"
import type { PaginationParams } from "@/lib/pagination"
import type { BacktestValues } from "./schema"
import type {
    Backtest,
    BacktestBatch,
    BacktestComparison,
    BacktestDetails,
    BacktestExecution,
    BacktestListStats,
    BacktestPreview,
    ExecutionStatus,
} from "./types"

// Valeurs d'un backtest : celles du formulaire complet, ou du test rapide qui n'a pas de lot de départs
type BacktestInput = Omit<BacktestValues, "multipleStarts" | "extraStartDates"> &
    Partial<Pick<BacktestValues, "multipleStarts" | "extraStartDates">>

// Body commun à la création, à la prévisualisation et au lot ; benchmarkSymbols vide ou absent : envoyé null (sans benchmark).
// Les champs du lot de départs ne partent qu'avec `startDates`
const toBacktestBody = ({ benchmarkSymbols, ...values }: BacktestInput, startDates?: Date[]) => {
    delete values.multipleStarts
    delete values.extraStartDates
    return JSON.stringify({ ...values, benchmarkSymbol: benchmarkSymbols?.[0] ?? null, startDates })
}

export async function createBacktest(values: BacktestInput): Promise<Backtest> {
    return apiFetch<Backtest>("/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: toBacktestBody(values),
    })
}

type BatchCreated = { batchId: string; backtests: Backtest[] }

/**
 * Crée un lot : la même stratégie à chaque date de départ (`start` puis `extraStartDates` du formulaire, 2 à 10).
 * Renvoie l'identifiant du lot et ses backtests, du plus ancien départ au plus récent.
 */
export async function createBacktestBatch(values: BacktestValues): Promise<BatchCreated> {
    return apiFetch<BatchCreated>("/backtest/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: toBacktestBody(values, [values.start, ...values.extraStartDates.map(({ date }) => date)]),
    })
}

/** Relance la stratégie d'un lot à de nouvelles dates : crée un nouveau lot, l'ancien reste intact. */
export async function restartBacktestBatch(batchId: string, startDates: Date[]): Promise<BatchCreated> {
    return apiFetch<BatchCreated>(`/backtest/batch/${batchId}/starts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDates }),
    })
}

/** Relance chaque départ d'un lot (nouvelle exécution de chacun). */
export async function rerunBacktestBatch(batchId: string): Promise<BacktestExecution[]> {
    return apiFetch<BacktestExecution[]>(`/backtest/batch/${batchId}/executions`, { method: "POST" })
}

export async function previewBacktest(values: BacktestInput): Promise<BacktestPreview> {
    return apiFetch<BacktestPreview>("/backtest/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: toBacktestBody(values),
    })
}

// status vide = tous les backtests ; hasResult : seulement ceux qui ont au moins une exécution terminée
export async function getBacktests({
    page,
    pageSize,
    status,
    hasResult,
}: PaginationParams & { status: readonly ExecutionStatus[]; hasResult?: boolean }): Promise<Paginated<Backtest>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (status.length) params.set("status", status.join(","))
    if (hasResult) params.set("hasResult", "true")
    return apiFetch<Paginated<Backtest>>(`/backtest?${params.toString()}`)
}

export async function getBacktestStats(): Promise<BacktestListStats> {
    return apiFetch<BacktestListStats>("/backtest/stats")
}

// a et b : ids distincts de deux backtests terminés, dans l'ordre A, B
export async function compareBacktests(a: string, b: string): Promise<BacktestComparison> {
    return apiFetch<BacktestComparison>(`/backtest/compare?ids=${a},${b}`)
}

export async function getBacktestBatch(batchId: string): Promise<BacktestBatch> {
    return apiFetch<BacktestBatch>(`/backtest/batch/${batchId}`)
}

export async function getBacktest(id: string): Promise<BacktestDetails> {
    return apiFetch<BacktestDetails>(`/backtest/${id}`)
}

export async function rerunBacktest(id: string): Promise<BacktestExecution> {
    return apiFetch<BacktestExecution>(`/backtest/${id}/executions`, { method: "POST" })
}
