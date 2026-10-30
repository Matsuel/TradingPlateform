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
        expect(result.totalFees).toBe(0);
    });

    test("les frais sont prélevés sur l'achat", () => {
        const result = runBacktest({ ...lumpSum, feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
        });

        expect(result.finalValue).toBe(990);
        expect(result.totalReturn).toBe(-0.01);
        expect(result.totalFees).toBe(10);
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

    test("enregistre chaque achat avec cours, quantité, montant et frais", () => {
        const result = runBacktest({ ...lumpSum, symbols: ["AAA", "BBB"], feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
            BBB: [{ date: "2024-01-02", close: 50 }],
        });

        expect(result.trades).toEqual([
            { date: "2024-01-02", symbol: "AAA", price: 10, quantity: 49.5, amount: 500, fee: 5 },
            { date: "2024-01-02", symbol: "BBB", price: 50, quantity: 9.9, amount: 500, fee: 5 },
        ]);
    });

    test("positions finales : quantités accumulées valorisées au dernier cours", () => {
        const result = runBacktest(
            { ...lumpSum, investmentMode: "RECURRING", initialAmount: 0, recurringAmount: 100, investmentFrequency: "MONTHLY" },
            {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 20 },
                    { date: "2024-02-02", close: 25 },
                ],
            },
        );

        expect(result.holdings).toEqual([{ symbol: "AAA", quantity: 15, value: 375 }]);
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

    describe("comparaison avec l'investissement unique", () => {
        const dca: BacktestParams = {
            ...lumpSum,
            investmentMode: "RECURRING",
            initialAmount: 0,
            recurringAmount: 100,
            investmentFrequency: "MONTHLY",
        };

        test("absente hors DCA", () => {
            const result = runBacktest(lumpSum, { AAA: [{ date: "2024-01-02", close: 10 }] });

            expect(result.lumpSumComparison).toBeNull();
        });

        test("marché haussier : l'investissement unique fait mieux", () => {
            const result = runBacktest(dca, {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 20 },
                    { date: "2024-03-01", close: 40 },
                ],
            });

            // DCA : 10 + 5 + 2,5 titres = 700 ; unique : 300 € à 10 = 30 titres = 1200
            expect(result.finalValue).toBe(700);
            expect(result.lumpSumComparison).toMatchObject({ finalValue: 1200, totalReturn: 3, dcaAdvantage: -500 });
        });

        test("baisse puis reprise : le DCA fait mieux", () => {
            const result = runBacktest(dca, {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 5 },
                    { date: "2024-03-01", close: 10 },
                ],
            });

            // DCA : 10 + 20 + 10 titres = 400 ; unique : 30 titres = 300
            expect(result.finalValue).toBe(400);
            expect(result.lumpSumComparison).toMatchObject({ finalValue: 300, totalReturn: 0, maxDrawdown: -0.5, dcaAdvantage: 100 });
        });

        test("même capital et mêmes frais, courbe sur les mêmes dates", () => {
            const prices = {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 10 },
                ],
            };
            const result = runBacktest({ ...dca, feeRate: 0.01 }, prices);

            // 200 € versés dans les deux cas, 1 % de frais : 198 € investis
            expect(result.lumpSumComparison!.finalValue).toBe(result.finalValue);
            expect(result.lumpSumComparison!.equityCurve).toEqual([
                { date: "2024-01-02", value: 198 },
                { date: "2024-02-01", value: 198 },
            ]);
        });
    });
});
