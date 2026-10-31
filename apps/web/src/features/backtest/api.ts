import { apiFetch } from "@/lib/api";
import type { Paginated } from "@trading-plateform/contracts";
import type { PaginationParams } from "@/lib/pagination";
import type { BacktestValues } from "./schema";
import type { Backtest, BacktestComparison, BacktestDetails, BacktestPreview, BacktestExecution, BacktestListStats, ExecutionStatus } from "./types";

// Body commun à la création et à la prévisualisation ; benchmarkSymbols vide ou absent : envoyé null (sans benchmark)
const toBacktestBody = ({ benchmarkSymbols, ...values }: BacktestValues) =>
    JSON.stringify({ ...values, benchmarkSymbol: benchmarkSymbols?.[0] ?? null });

export async function createBacktest(values: BacktestValues): Promise<Backtest> {
    return apiFetch<Backtest>("/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: toBacktestBody(values),
    });
}

export async function previewBacktest(values: BacktestValues): Promise<BacktestPreview> {
    return apiFetch<BacktestPreview>("/backtest/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: toBacktestBody(values),
    });
}

// status vide = tous les backtests
export async function getBacktests({ page, pageSize, status }: PaginationParams & { status: readonly ExecutionStatus[] }): Promise<Paginated<Backtest>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status.length) params.set("status", status.join(","));
    return apiFetch<Paginated<Backtest>>(`/backtest?${params.toString()}`);
}

export async function getBacktestStats(): Promise<BacktestListStats> {
    return apiFetch<BacktestListStats>("/backtest/stats");
}

// a et b : ids distincts de deux backtests terminés, dans l'ordre A, B
export async function compareBacktests(a: string, b: string): Promise<BacktestComparison> {
    return apiFetch<BacktestComparison>(`/backtest/compare?ids=${a},${b}`);
}

export async function getBacktest(id: string): Promise<BacktestDetails> {
    return apiFetch<BacktestDetails>(`/backtest/${id}`);
}

export async function rerunBacktest(id: string): Promise<BacktestExecution> {
    return apiFetch<BacktestExecution>(`/backtest/${id}/executions`, { method: "POST" });
}
