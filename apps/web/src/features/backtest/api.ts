import { apiFetch } from "@/lib/api";
import type { Paginated } from "@trading-plateform/contracts";
import type { PaginationParams } from "@/lib/pagination";
import type { BacktestValues } from "./schema";
import type { Backtest, BacktestDetails, BacktestExecution, BacktestListStats, ExecutionStatus } from "./types";

// benchmarkSymbols vide ou absent : envoyé null (sans benchmark)
export async function createBacktest({ benchmarkSymbols, ...values }: BacktestValues): Promise<Backtest> {
    return apiFetch<Backtest>("/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, benchmarkSymbol: benchmarkSymbols?.[0] ?? null }),
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

export async function getBacktest(id: string): Promise<BacktestDetails> {
    return apiFetch<BacktestDetails>(`/backtest/${id}`);
}

export async function rerunBacktest(id: string): Promise<BacktestExecution> {
    return apiFetch<BacktestExecution>(`/backtest/${id}/executions`, { method: "POST" });
}
