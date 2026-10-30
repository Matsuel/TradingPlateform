import { describe, expect, test } from "bun:test";
import runBacktest from "./backtest.engine";
import { referencePrices } from "./backtest.fixture";
import type { BacktestParams } from "../interfaces/backtest.interface";

const lumpSum: BacktestParams = {
    allocations: [{ symbol: "AAA", weight: 1 }],
    investmentMode: "LUMP_SUM",
    initialAmount: 1000,
    recurringAmount: null,
    investmentFrequency: null,
    feeRate: 0,
};

// 100 € le premier jour de cotation de chaque mois
const dca: BacktestParams = {
    ...lumpSum,
    investmentMode: "RECURRING",
    initialAmount: 0,
    recurringAmount: 100,
    investmentFrequency: "MONTHLY",
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
        expect(result.profit).toBe(500);
        expect(result.totalReturn).toBe(0.5);
        expect(result.totalTrades).toBe(1);
        expect(result.totalFees).toBe(0);
    });

    test("les frais sont prélevés sur l'achat", () => {
        const result = runBacktest({ ...lumpSum, feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
        });

        expect(result.finalValue).toBe(990);
        expect(result.profit).toBe(-10);
        expect(result.totalReturn).toBe(-0.01);
        expect(result.totalFees).toBe(10);
    });

    test("total des frais calculé sur les frais non arrondis de chaque achat", () => {
        // 3 achats de 34, 33 et 33 € à 0,1 % : 0,034 + 0,033 + 0,033 €, affichés 0,03 € chacun, total exact 0,10 €
        const result = runBacktest({ ...lumpSum, allocations: [{ symbol: "AAA", weight: 0.34 }, { symbol: "BBB", weight: 0.33 }, { symbol: "CCC", weight: 0.33 }], initialAmount: 100, feeRate: 0.001 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
            BBB: [{ date: "2024-01-02", close: 10 }],
            CCC: [{ date: "2024-01-02", close: 10 }],
        });

        expect(result.trades.map((trade) => trade.amount)).toEqual([34, 33, 33]);
        expect(result.trades.map((trade) => trade.fee)).toEqual([0.03, 0.03, 0.03]);
        expect(result.totalFees).toBe(0.1);
    });

    test("DCA mensuel verse au premier jour de chaque mois", () => {
        const result = runBacktest(dca, {
            AAA: [
                { date: "2024-01-30", close: 10 },
                { date: "2024-01-31", close: 10 },
                { date: "2024-02-01", close: 20 },
            ],
        });

        expect(result.equityCurve.map((point) => point.invested)).toEqual([100, 100, 200]);
        expect(result.finalValue).toBe(300);
        expect(result.totalInvested).toBe(200);
        expect(result.totalTrades).toBe(2);
    });

    test("multi-symboles : départ commun et report du dernier cours", () => {
        const result = runBacktest({ ...lumpSum, allocations: [{ symbol: "AAA", weight: 0.5 }, { symbol: "BBB", weight: 0.5 }] }, {
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
        const result = runBacktest({ ...lumpSum, allocations: [{ symbol: "AAA", weight: 0.5 }, { symbol: "BBB", weight: 0.5 }], feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
            BBB: [{ date: "2024-01-02", close: 50 }],
        });

        expect(result.trades).toEqual([
            { date: "2024-01-02", symbol: "AAA", price: 10, quantity: 49.5, amount: 500, fee: 5 },
            { date: "2024-01-02", symbol: "BBB", price: 50, quantity: 9.9, amount: 500, fee: 5 },
        ]);
    });

    test("versement réparti selon les poids cibles, frais déduits de chaque ordre", () => {
        const result = runBacktest({ ...lumpSum, allocations: [{ symbol: "AAA", weight: 0.6 }, { symbol: "BBB", weight: 0.4 }], initialAmount: 10_000, feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
            BBB: [{ date: "2024-01-02", close: 50 }],
        });

        // Montant d'ordre frais compris : 6 000 € dont 60 € de frais ⇒ 5 940 € investis
        expect(result.trades).toEqual([
            { date: "2024-01-02", symbol: "AAA", price: 10, quantity: 594, amount: 6000, fee: 60 },
            { date: "2024-01-02", symbol: "BBB", price: 50, quantity: 79.2, amount: 4000, fee: 40 },
        ]);
        expect(result.totalInvested).toBe(10_000);
        expect(result.totalFees).toBe(100);
        expect(result.finalValue).toBe(9900);
    });

    test("positions finales : quantités accumulées valorisées au dernier cours", () => {
        const result = runBacktest(dca, {
            AAA: [
                { date: "2024-01-02", close: 10 },
                { date: "2024-02-01", close: 20 },
                { date: "2024-02-02", close: 25 },
            ],
        });

        expect(result.holdings).toEqual([{ symbol: "AAA", quantity: 15, value: 375 }]);
    });

    test("drawdown max mesuré hors versements", () => {
        const result = runBacktest(dca, {
            AAA: [
                { date: "2024-01-02", close: 10 },
                { date: "2024-02-01", close: 5 },
                { date: "2024-03-01", close: 10 },
            ],
        });

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
        test("absente hors DCA", () => {
            const result = runBacktest(lumpSum, { AAA: [{ date: "2024-01-02", close: 10 }] });

            expect(result.lumpSumComparison).toBeNull();
            expect(result.equityCurve[0]).not.toHaveProperty("lumpSumValue");
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
            expect(result.lumpSumComparison).toEqual({ finalValue: 1200, totalReturn: 3, maxDrawdown: 0, dcaAdvantage: -500 });
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
            expect(result.lumpSumComparison).toEqual({ finalValue: 300, totalReturn: 0, maxDrawdown: -0.5, dcaAdvantage: 100 });
        });

        test("même capital et mêmes frais, valeur ajoutée à chaque point de la courbe", () => {
            const result = runBacktest({ ...dca, feeRate: 0.01 }, {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 10 },
                ],
            });

            // 200 € versés dans les deux cas, 1 % de frais : 198 € investis
            expect(result.lumpSumComparison!.finalValue).toBe(result.finalValue);
            expect(result.equityCurve).toEqual([
                { date: "2024-01-02", value: 99, invested: 100, lumpSumValue: 198 },
                { date: "2024-02-01", value: 198, invested: 200, lumpSumValue: 198 },
            ]);
        });
    });

    test("règle d'exécution publiée avec le résultat", () => {
        expect(runBacktest(lumpSum, { AAA: [{ date: "2024-01-02", close: 10 }] }).executionRule).toBe("CLOSE_ON_SCHEDULED_DAY");
    });

    describe("reproductibilité", () => {
        const params: BacktestParams = { ...dca, allocations: [{ symbol: "AAA", weight: 0.5 }, { symbol: "BBB", weight: 0.5 }], feeRate: 0.001 };

        test("mêmes paramètres et mêmes cours : résultat strictement identique", () => {
            expect(runBacktest(params, referencePrices)).toEqual(runBacktest(params, referencePrices));
        });

        test("mêmes poids et mêmes cours : résultat strictement identique, poids pris en compte", () => {
            const weighted: BacktestParams = { ...params, allocations: [{ symbol: "AAA", weight: 0.6 }, { symbol: "BBB", weight: 0.4 }] };

            expect(runBacktest(weighted, referencePrices)).toEqual(runBacktest(weighted, referencePrices));
            expect(runBacktest(weighted, referencePrices).finalValue).not.toBe(runBacktest(params, referencePrices).finalValue);
        });

        test("n'altère pas les cours reçus", () => {
            const before = structuredClone(referencePrices);
            runBacktest(params, referencePrices);

            expect(referencePrices).toEqual(before);
        });

        // Valeurs de référence figées : un écart signale un changement de calcul, à justifier puis à mettre à jour ici.
        // Poids 50/50 exactement représentables : identiques à l'ancienne répartition équipondérée (non-régression T-02)
        test("jeu de référence : métriques figées", () => {
            const { equityCurve, trades, holdings, ...metrics } = runBacktest(params, referencePrices);

            expect(metrics).toEqual({
                finalValue: 2449.7,
                totalInvested: 2400,
                totalFees: 2.4,
                profit: 49.7,
                totalReturn: 0.020708,
                totalTrades: 48,
                maxDrawdown: -0.295875,
                maxDrawdownDate: "2023-07-07",
                executionRule: "CLOSE_ON_SCHEDULED_DAY",
                lumpSumComparison: { finalValue: 2363.86, totalReturn: -0.015058, maxDrawdown: -0.302102, dcaAdvantage: 85.84 },
            });
            expect(equityCurve).toHaveLength(520);
            expect(trades).toHaveLength(48);
            expect(holdings).toEqual([
                { symbol: "AAA", quantity: 12.654115, value: 1079.4 },
                { symbol: "BBB", quantity: 23.985752, value: 1370.31 },
            ]);
        });
    });
});
