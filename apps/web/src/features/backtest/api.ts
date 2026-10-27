import { apiFetch } from "@/lib/api";
import type { BacktestValues } from "./schema";
import type { Backtest } from "./types";

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
