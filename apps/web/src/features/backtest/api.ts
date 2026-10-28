import { apiFetch } from "@/lib/api";
import type { BacktestValues } from "./schema";
import type { Backtest, BacktestDetails, BacktestExecution } from "./types";

export async function createBacktest(values: BacktestValues): Promise<Backtest> {
    return apiFetch<Backtest>("/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
}

export async function getBacktests(): Promise<Backtest[]> {
    const { data } = await apiFetch<{ data: Backtest[]; count: number }>("/backtest");
    return data;
}

export async function getBacktest(id: string): Promise<BacktestDetails> {
    return apiFetch<BacktestDetails>(`/backtest/${id}`);
}

export async function rerunBacktest(id: string): Promise<BacktestExecution> {
    return apiFetch<BacktestExecution>(`/backtest/${id}/executions`, { method: "POST" });
}
