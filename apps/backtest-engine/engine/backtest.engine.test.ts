import { describe, expect, test } from "bun:test";
import runBacktest from "./backtest.engine";
import type { BacktestParams } from "../interfaces/backtest.interface";

const lumpSum: BacktestParams = {
    symbols: ["AAA"],
    investmentMode: "LUMP_SUM",
    initialAmount: 1000,
    recurringAmount: null,
    investmentFrequency: null,
    feeRate: 0,
};

describe("runBacktest", () => {
    test("lump sum suit le cours", () => {
        const result = runBacktest(lumpSum, {
            AAA: [
                { date: "2024-01-02", close: 10 },
                { date: "2024-01-03", close: 12 },
                { date: "2024-01-04", close: 15 },
            ],
        });

        expect(result.equityCurve).toEqual([
            { date: "2024-01-02", value: 1000, invested: 1000 },
            { date: "2024-01-03", value: 1200, invested: 1000 },
            { date: "2024-01-04", value: 1500, invested: 1000 },
        ]);
        expect(result.finalValue).toBe(1500);
        expect(result.totalInvested).toBe(1000);
        expect(result.totalReturn).toBe(0.5);
        expect(result.totalTrades).toBe(1);
    });

    test("les frais sont prélevés sur l'achat", () => {
        const result = runBacktest({ ...lumpSum, feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
        });

        expect(result.finalValue).toBe(990);
        expect(result.totalReturn).toBe(-0.01);
    });

    test("DCA mensuel verse au premier jour de chaque mois", () => {
        const result = runBacktest(
            { ...lumpSum, investmentMode: "RECURRING", initialAmount: 0, recurringAmount: 100, investmentFrequency: "MONTHLY" },
            {
                AAA: [
                    { date: "2024-01-30", close: 10 },
                    { date: "2024-01-31", close: 10 },
                    { date: "2024-02-01", close: 20 },
                ],
            },
        );

        expect(result.equityCurve.map((point) => point.invested)).toEqual([100, 100, 200]);
        expect(result.finalValue).toBe(300);
        expect(result.totalInvested).toBe(200);
        expect(result.totalTrades).toBe(2);
    });

    test("multi-symboles : départ commun et report du dernier cours", () => {
        const result = runBacktest({ ...lumpSum, symbols: ["AAA", "BBB"] }, {
            AAA: [
                { date: "2024-01-01", close: 10 },
                { date: "2024-01-02", close: 10 },
                { date: "2024-01-03", close: 20 },
            ],
            BBB: [
                { date: "2024-01-02", close: 50 },
                { date: "2024-01-04", close: 100 },
            ],
        });

        expect(result.equityCurve).toEqual([
            { date: "2024-01-02", value: 1000, invested: 1000 },
            { date: "2024-01-03", value: 1500, invested: 1000 },
            { date: "2024-01-04", value: 2000, invested: 1000 },
        ]);
        expect(result.totalTrades).toBe(2);
    });

    test("enregistre chaque achat avec son cours", () => {
        const result = runBacktest({ ...lumpSum, symbols: ["AAA", "BBB"] }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
            BBB: [{ date: "2024-01-02", close: 50 }],
        });

        expect(result.trades).toEqual([
            { date: "2024-01-02", symbol: "AAA", price: 10 },
            { date: "2024-01-02", symbol: "BBB", price: 50 },
        ]);
    });

    test("drawdown max mesuré hors versements", () => {
        const result = runBacktest(
            { ...lumpSum, investmentMode: "RECURRING", initialAmount: 0, recurringAmount: 100, investmentFrequency: "MONTHLY" },
            {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 5 },
                    { date: "2024-03-01", close: 10 },
                ],
            },
        );

        expect(result.maxDrawdown).toBe(-0.5);
        expect(result.maxDrawdownDate).toBe("2024-02-01");
    });

    test("sans baisse, pas de drawdown", () => {
        const result = runBacktest(lumpSum, {
            AAA: [
                { date: "2024-01-02", close: 10 },
                { date: "2024-01-03", close: 12 },
            ],
        });

        expect(result.maxDrawdown).toBe(0);
        expect(result.maxDrawdownDate).toBeNull();
    });

    test("échoue sans données de marché", () => {
        expect(() => runBacktest(lumpSum, { AAA: [] })).toThrow("No market data for AAA");
    });
});
