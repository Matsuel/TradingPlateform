import { describe, expect, test } from "bun:test";
import runBacktest from "../engine/backtest.engine";
import { referencePrices, syntheticSeries } from "./backtest.fixture";
import type { BacktestParams } from "../interfaces/backtest.interface";

const lumpSum: BacktestParams = {
    allocations: [{ symbol: "AAA", weight: 1 }],
    investmentMode: "LUMP_SUM",
    initialAmount: 1000,
    recurringAmount: null,
    investmentFrequency: null,
    rebalanceFrequency: "NONE",
    feeRate: 0,
    benchmarkSymbol: null,
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
            { date: "2024-01-02", value: 1000, invested: 1000, drawdown: 0 },
            { date: "2024-01-03", value: 1200, invested: 1000, drawdown: 0 },
            { date: "2024-01-04", value: 1500, invested: 1000, drawdown: 0 },
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
            { date: "2024-01-02", value: 1000, invested: 1000, drawdown: 0 },
            { date: "2024-01-03", value: 1500, invested: 1000, drawdown: 0 },
            { date: "2024-01-04", value: 2000, invested: 1000, drawdown: 0 },
        ]);
        expect(result.totalTrades).toBe(2);
    });

    test("enregistre chaque achat avec cours, quantité, montant et frais", () => {
        const result = runBacktest({ ...lumpSum, allocations: [{ symbol: "AAA", weight: 0.5 }, { symbol: "BBB", weight: 0.5 }], feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
            BBB: [{ date: "2024-01-02", close: 50 }],
        });

        expect(result.trades).toEqual([
            { date: "2024-01-02", symbol: "AAA", side: "BUY", price: 10, quantity: 49.5, amount: 500, fee: 5 },
            { date: "2024-01-02", symbol: "BBB", side: "BUY", price: 50, quantity: 9.9, amount: 500, fee: 5 },
        ]);
    });

    test("versement réparti selon les poids cibles, frais déduits de chaque ordre", () => {
        const result = runBacktest({ ...lumpSum, allocations: [{ symbol: "AAA", weight: 0.6 }, { symbol: "BBB", weight: 0.4 }], initialAmount: 10_000, feeRate: 0.01 }, {
            AAA: [{ date: "2024-01-02", close: 10 }],
            BBB: [{ date: "2024-01-02", close: 50 }],
        });

        // Montant d'ordre frais compris : 6 000 € dont 60 € de frais ⇒ 5 940 € investis
        expect(result.trades).toEqual([
            { date: "2024-01-02", symbol: "AAA", side: "BUY", price: 10, quantity: 594, amount: 6000, fee: 60 },
            { date: "2024-01-02", symbol: "BBB", side: "BUY", price: 50, quantity: 79.2, amount: 4000, fee: 40 },
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
        expect(result.equityCurve.map((point) => point.drawdown)).toEqual([0, -0.5, 0]);
        expect(result.maxDrawdownPeakDate).toBe("2024-01-02");
        expect(result.maxDrawdownRecoveryDate).toBe("2024-03-01");
        expect(result.recoveryDays).toBe(59);
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
                { date: "2024-01-02", value: 99, invested: 100, lumpSumValue: 198, drawdown: 0 },
                { date: "2024-02-01", value: 198, invested: 200, lumpSumValue: 198, drawdown: 0 },
            ]);
        });
    });

    describe("rebalancement", () => {
        const balanced: BacktestParams = { ...lumpSum, allocations: [{ symbol: "AAA", weight: 0.5 }, { symbol: "BBB", weight: 0.5 }], rebalanceFrequency: "MONTHLY" };
        // Trajectoires opposées : AAA double, BBB est divisé par deux, puis nouvelle période au 1er février
        const diverging = {
            AAA: [
                { date: "2024-01-02", close: 10 },
                { date: "2024-01-31", close: 20 },
                { date: "2024-02-01", close: 20 },
            ],
            BBB: [
                { date: "2024-01-02", close: 10 },
                { date: "2024-01-31", close: 5 },
                { date: "2024-02-01", close: 5 },
            ],
        };
        const weights = (holdings: { value: number }[]) => {
            const total = holdings.reduce((sum, holding) => sum + holding.value, 0);
            return holdings.map((holding) => holding.value / total);
        };
        const rebalanceDates = (params: BacktestParams) =>
            [...new Set(runBacktest(params, referencePrices).trades.filter((trade) => trade.side === "SELL").map((trade) => trade.date))];

        test("poids dérivés sans rebalancement, ramenés à la cible après", () => {
            expect(weights(runBacktest({ ...balanced, rebalanceFrequency: "NONE" }, diverging).holdings)).toEqual([0.8, 0.2]);

            const [aaa, bbb] = weights(runBacktest(balanced, diverging).holdings);
            expect(aaa).toBeCloseTo(0.5, 10);
            expect(bbb).toBeCloseTo(0.5, 10);
        });

        test("avec frais : poids à la cible à feeRate près", () => {
            const feeRate = 0.01;
            for (const weight of weights(runBacktest({ ...balanced, feeRate }, diverging).holdings)) {
                expect(Math.abs(weight - 0.5)).toBeLessThan(feeRate);
            }
        });

        test("vente puis achat autofinancé, frais sur chaque ordre", () => {
            const result = runBacktest({ ...balanced, feeRate: 0.02 }, {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 20 },
                ],
                BBB: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 10 },
                ],
            });

            // 49 titres de chaque ; au 1er février 980 € + 490 € = 1 470 €, cible 735 € : vente de 245 € d'AAA (4,90 € de frais),
            // les 240,10 € nets rachètent du BBB (4,80 € de frais)
            expect(result.trades.slice(2)).toEqual([
                { date: "2024-02-01", symbol: "AAA", side: "SELL", price: 20, quantity: 12.25, amount: 245, fee: 4.9 },
                { date: "2024-02-01", symbol: "BBB", side: "BUY", price: 10, quantity: 23.5298, amount: 240.1, fee: 4.8 },
            ]);
            expect(result.holdings).toEqual([
                { symbol: "AAA", quantity: 36.75, value: 735 },
                { symbol: "BBB", quantity: 72.5298, value: 725.3 },
            ]);
            expect(result.totalInvested).toBe(1000);
            expect(result.totalFees).toBe(29.7);
            expect(result.totalTrades).toBe(4);
            expect(result.rebalanceCount).toBe(1);
            expect(result.finalValue).toBe(1460.3);
        });

        test("versement d'abord, puis rebalancement le même jour", () => {
            const result = runBacktest({ ...balanced, investmentMode: "RECURRING", initialAmount: 0, recurringAmount: 100, investmentFrequency: "MONTHLY" }, {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 20 },
                ],
                BBB: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-02-01", close: 10 },
                ],
            });

            // Après le versement : AAA 7,5 × 20 = 150 €, BBB 10 × 10 = 100 €, cible 125 € chacun
            expect(result.trades.filter((trade) => trade.date === "2024-02-01")).toEqual([
                { date: "2024-02-01", symbol: "AAA", side: "BUY", price: 20, quantity: 2.5, amount: 50, fee: 0 },
                { date: "2024-02-01", symbol: "BBB", side: "BUY", price: 10, quantity: 5, amount: 50, fee: 0 },
                { date: "2024-02-01", symbol: "AAA", side: "SELL", price: 20, quantity: 1.25, amount: 25, fee: 0 },
                { date: "2024-02-01", symbol: "BBB", side: "BUY", price: 10, quantity: 2.5, amount: 25, fee: 0 },
            ]);
        });

        test("jamais le premier jour de la simulation", () => {
            const result = runBacktest(balanced, { AAA: [{ date: "2024-01-02", close: 10 }], BBB: [{ date: "2024-01-02", close: 20 }] });

            expect(result.trades.every((trade) => trade.side === "BUY")).toBe(true);
            expect(result.totalTrades).toBe(2);
            expect(result.rebalanceCount).toBe(0);
        });

        test("une date par période : premier jour de cotation de chaque mois, trimestre ou année", () => {
            const params: BacktestParams = { ...balanced, initialAmount: 10_000 };
            const monthly = rebalanceDates(params);

            expect(monthly).toHaveLength(23);
            expect(monthly[0]).toBe("2022-02-01");
            expect(rebalanceDates({ ...params, rebalanceFrequency: "QUARTERLY" })).toEqual([
                "2022-04-01", "2022-07-01", "2022-10-03", "2023-01-02", "2023-04-03", "2023-07-03", "2023-10-02",
            ]);
            expect(rebalanceDates({ ...params, rebalanceFrequency: "YEARLY" })).toEqual(["2023-01-02"]);
        });

        test("NONE : aucune vente", () => {
            expect(rebalanceDates({ ...balanced, rebalanceFrequency: "NONE" })).toEqual([]);
        });

        test("sans frais, la valeur du jour est inchangée : pas de rendement artificiel", () => {
            const none = runBacktest({ ...balanced, rebalanceFrequency: "NONE" }, diverging);
            const monthly = runBacktest(balanced, diverging);

            expect(monthly.equityCurve).toEqual(none.equityCurve);
            expect(monthly.maxDrawdown).toBe(none.maxDrawdown);
        });

        test("reproductible sur le jeu de référence", () => {
            const params: BacktestParams = { ...balanced, investmentMode: "RECURRING", initialAmount: 0, recurringAmount: 100, investmentFrequency: "MONTHLY", feeRate: 0.001 };

            expect(runBacktest(params, referencePrices)).toEqual(runBacktest(params, referencePrices));
        });
    });

    describe("benchmark", () => {
        const withBenchmark: BacktestParams = { ...dca, feeRate: 0.001, benchmarkSymbol: "BBB" };

        test("absent sans benchmarkSymbol : benchmark null, pas de benchmarkValue", () => {
            const result = runBacktest(dca, referencePrices);

            expect(result.benchmark).toBeNull();
            expect(result.equityCurve.some((point) => "benchmarkValue" in point)).toBe(false);
        });

        test("identique à l'unique actif du portefeuille : mêmes métriques, écarts nuls", () => {
            const result = runBacktest({ ...withBenchmark, benchmarkSymbol: "AAA" }, referencePrices);

            expect(result.benchmark).toEqual({
                symbol: "AAA",
                finalValue: result.finalValue,
                totalReturn: result.totalReturn,
                cagr: result.cagr,
                volatility: result.volatility,
                sharpeRatio: result.sharpeRatio,
                maxDrawdown: result.maxDrawdown,
                recoveryDays: result.recoveryDays,
                excessCagr: 0,
                excessVolatility: 0,
                excessMaxDrawdown: 0,
                excessSharpe: 0,
            });
            expect(result.equityCurve.every((point) => point.benchmarkValue === point.value)).toBe(true);
        });

        // AAA et BBB cotent les mêmes jours : le calendrier commun ne change rien à BBB seul
        test("mêmes versements, dates et frais, 100 % sur le benchmark sans rebalancement", () => {
            const result = runBacktest({ ...withBenchmark, rebalanceFrequency: "MONTHLY" }, referencePrices);
            const alone = runBacktest({ ...withBenchmark, allocations: [{ symbol: "BBB", weight: 1 }], rebalanceFrequency: "NONE", benchmarkSymbol: null }, referencePrices);

            expect(result.benchmark!.finalValue).toBe(alone.finalValue);
            expect(result.benchmark!.maxDrawdown).toBe(alone.maxDrawdown);
            expect(result.equityCurve.map((point) => point.benchmarkValue)).toEqual(alone.equityCurve.map((point) => point.value));
        });

        test("écarts stratégie − benchmark calculés par l'engine", () => {
            const result = runBacktest(withBenchmark, referencePrices);
            const benchmark = result.benchmark!;

            expect(benchmark.excessCagr).toBeCloseTo(result.cagr! - benchmark.cagr!, 6);
            expect(benchmark.excessVolatility).toBeCloseTo(result.volatility! - benchmark.volatility!, 6);
            expect(benchmark.excessMaxDrawdown).toBeCloseTo(result.maxDrawdown - benchmark.maxDrawdown, 6);
            expect(benchmark.excessSharpe).toBeCloseTo(result.sharpeRatio! - benchmark.sharpeRatio!, 6);
        });

        test("départ commun, dates de la stratégie seules : le benchmark reporte son dernier cours", () => {
            const result = runBacktest({ ...lumpSum, benchmarkSymbol: "BBB" }, {
                AAA: [
                    { date: "2024-01-02", close: 10 },
                    { date: "2024-01-03", close: 11 },
                    { date: "2024-01-05", close: 12 },
                ],
                BBB: [
                    { date: "2024-01-03", close: 20 },
                    { date: "2024-01-04", close: 22 },
                ],
            });

            expect(result.equityCurve).toEqual([
                { date: "2024-01-03", value: 1000, invested: 1000, drawdown: 0, benchmarkValue: 1000 },
                { date: "2024-01-05", value: 1090.91, invested: 1000, drawdown: 0, benchmarkValue: 1100 },
            ]);
        });

        test("échoue sans données pour le benchmark", () => {
            expect(() => runBacktest({ ...lumpSum, benchmarkSymbol: "URTH" }, { AAA: [{ date: "2024-01-02", close: 10 }] })).toThrow(
                "No market data for URTH",
            );
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
            const { equityCurve, trades, holdings, rollingSummary, ...metrics } = runBacktest(params, referencePrices);

            expect(metrics).toEqual({
                finalValue: 2449.7,
                totalInvested: 2400,
                totalFees: 2.4,
                profit: 49.7,
                totalReturn: 0.020708,
                priceReturn: 0.020708,
                dividendTotal: 0,
                dividendGain: 0,
                dividendEvents: [],
                returnBreakdown: { price: 0.020708, dividends: 0, local: 0.020708, fx: null },
                totalTrades: 48,
                rebalanceCount: 0,
                maxDrawdown: -0.295875,
                maxDrawdownDate: "2023-07-07",
                maxDrawdownPeakDate: "2022-05-06",
                maxDrawdownRecoveryDate: "2023-10-26",
                recoveryDays: 538,
                cagr: -0.00426,
                volatility: 0.21697,
                sharpeRatio: -0.019632,
                executionRule: "CLOSE_ON_SCHEDULED_DAY",
                riskFreeRate: 0,
                                lumpSumComparison: { finalValue: 2363.86, totalReturn: -0.015058, maxDrawdown: -0.302102, dcaAdvantage: 85.84 },
                benchmark: null,
            });
            // Deux ans d'historique : seules les fenêtres d'un an existent ; la courbe porte un point par fenêtre
            expect(rollingSummary.map(({ years, count, points }) => [years, count, points.length])).toEqual([[1, 259, 259]]);
            expect(rollingSummary[0]).toMatchObject({ worst: -0.280841, median: -0.059272, best: 0.097355, negativeShare: 0.722008 });
            expect(equityCurve).toHaveLength(520);
            expect(trades).toHaveLength(48);
            expect(holdings).toEqual([
                { symbol: "AAA", quantity: 12.654115, value: 1079.4 },
                { symbol: "BBB", quantity: 23.985752, value: 1370.31 },
            ]);
        });
    });

    // Ordre de grandeur réel d'un long backtest : sert aussi à mesurer la taille du message backtest.completed (T-17)
    test("bout en bout sur 20 ans à 3 actifs : métriques présentes et cohérentes", () => {
        const days = 20 * 261;
        const prices = {
            AAA: syntheticSeries(42, "2004-01-05", days, 10_000),
            BBB: syntheticSeries(7, "2004-01-05", days, 5_000),
            CCC: syntheticSeries(1234, "2004-01-05", days, 20_000),
        };
        const result = runBacktest(
            {
                ...dca,
                allocations: [{ symbol: "AAA", weight: 0.5 }, { symbol: "BBB", weight: 0.3 }, { symbol: "CCC", weight: 0.2 }],
                rebalanceFrequency: "QUARTERLY",
                feeRate: 0.001,
            },
            prices,
        );
        const drawdowns = result.equityCurve.map((point) => point.drawdown);

        expect(result.equityCurve).toHaveLength(days);
        expect(result.maxDrawdown).toBe(Math.min(...drawdowns));
        expect(result.equityCurve.find((point) => point.drawdown === result.maxDrawdown)!.date).toBe(result.maxDrawdownDate!);
        expect(result.maxDrawdownPeakDate! < result.maxDrawdownDate!).toBe(true);
        expect(result.cagr).not.toBeNull();
        expect(result.volatility!).toBeGreaterThan(0);
        expect(result.sharpeRatio).toBeCloseTo(result.cagr! / result.volatility!, 4);
        if (result.maxDrawdownRecoveryDate === null) expect(result.recoveryDays).toBeNull();
        else expect(result.recoveryDays!).toBeGreaterThan(0);
    });
});

describe("dividendes réinvestis (D1)", () => {
    const flat = (symbol: string, close: number) => ({ [symbol]: ["2024-01-02", "2024-01-03", "2024-01-04"].map((date) => ({ date, close })) });

    test("1,595 par titre sur 100 titres : 159,50 réinvestis au cours de l'ex-date, sans frais", () => {
        const result = runBacktest({ ...lumpSum, initialAmount: 1000 }, flat("AAA", 10), {
            dividends: { AAA: [{ date: "2024-01-03", amount: 1.595 }] },
        });

        expect(result.dividendTotal).toBe(159.5);
        // 100 titres + 159,5 / 10 = 115,95 titres
        expect(result.holdings).toEqual([{ symbol: "AAA", quantity: 115.95, value: 1159.5 }]);
        expect(result.totalFees).toBe(0);
        expect(result.totalTrades).toBe(1);
        expect(result.totalReturn).toBe(0.1595);
    });

    test("chaque dividende est publié avec son montant et les titres rachetés, la courbe garde la valeur sans dividende", () => {
        const result = runBacktest(lumpSum, flat("AAA", 10), { dividends: { AAA: [{ date: "2024-01-03", amount: 1.595 }] } });

        expect(result.dividendEvents).toEqual([{ date: "2024-01-03", symbol: "AAA", amount: 159.5, quantity: 15.95 }]);
        expect(result.equityCurve.map((point) => point.priceOnlyValue)).toEqual([1000, 1000, 1000]);
        expect(result.equityCurve.map((point) => point.value)).toEqual([1000, 1159.5, 1159.5]);
        expect(result.priceReturn).toBe(0);
        expect(result.dividendGain).toBe(159.5);
        expect(result.returnBreakdown).toEqual({ price: 0, dividends: 0.1595, local: 0.1595, fx: null });
    });

    test("sans dividende, la courbe n'a pas de priceOnlyValue", () => {
        const result = runBacktest(lumpSum, flat("AAA", 10));

        expect(result.equityCurve.every((point) => !("priceOnlyValue" in point))).toBe(true);
    });

    test("le rendement total dépasse le rendement cours seul", () => {
        const prices = { AAA: [{ date: "2024-01-02", close: 10 }, { date: "2024-01-03", close: 11 }, { date: "2024-01-04", close: 12 }] };
        const priceOnly = runBacktest(lumpSum, prices);
        const total = runBacktest(lumpSum, prices, { dividends: { AAA: [{ date: "2024-01-03", amount: 0.5 }] } });

        expect(total.totalReturn).toBeGreaterThan(priceOnly.totalReturn);
        // priceReturn de l'exécution avec dividendes = rendement de l'exécution sans dividende
        expect(total.priceReturn).toBe(priceOnly.totalReturn);
        expect(priceOnly.priceReturn).toBe(priceOnly.totalReturn);
        expect(priceOnly.dividendTotal).toBe(0);
    });

    test("un benchmark qui retarde le départ : les rejeux sans dividendes gardent le calendrier de la courbe", () => {
        const prices = { AAA: syntheticSeries(1, "2020-01-02", 300, 10_000), LATE: syntheticSeries(3, "2020-06-01", 200, 7_000) };
        const result = runBacktest({ ...lumpSum, benchmarkSymbol: "LATE" }, prices, { dividends: { AAA: [{ date: prices.AAA[150]!.date, amount: 0.4 }] } });

        expect(result.equityCurve[0]!.date).toBe(prices.LATE[0]!.date);
        expect(result.equityCurve.every((point) => typeof point.priceOnlyValue === "number" && typeof point.benchmarkValue === "number")).toBe(true);
        expect(result.dividendGain).toBeGreaterThan(0);
    });

    test("un dividende arrondi à 0 € ne change ni le gain ni la courbe", () => {
        const result = runBacktest(lumpSum, flat("AAA", 10), { dividends: { AAA: [{ date: "2024-01-03", amount: 0.000001 }] } });

        expect(result.dividendTotal).toBe(0);
        expect(result.dividendGain).toBe(0);
        expect(result.equityCurve.every((point) => !("priceOnlyValue" in point))).toBe(true);
    });

    test("un dividende détaché avant le premier achat n'est pas perçu", () => {
        const result = runBacktest(lumpSum, flat("AAA", 10), { dividends: { AAA: [{ date: "2023-12-15", amount: 1 }] } });

        expect(result.dividendTotal).toBe(0);
    });

    test("parité avec un calcul à la main sur 2 ans (dividende trimestriel de 0,25)", () => {
        const prices = { AAA: syntheticSeries(42, "2022-01-03", 520, 10_000) };
        const exDates = ["2022-03-15", "2022-06-15", "2022-09-15", "2022-12-15", "2023-03-15", "2023-06-15", "2023-09-15", "2023-12-15"]
            .map((wanted) => prices.AAA.find((point) => point.date >= wanted)!.date);

        // Calcul à la main : 1000 / cours initial titres, chaque dividende ajoute (titres × 0,25) / cours de l'ex-date
        let shares = 1000 / prices.AAA[0]!.close;
        let received = 0;
        for (const date of exDates) {
            const cash = shares * 0.25;
            received += cash;
            shares += cash / prices.AAA.find((point) => point.date === date)!.close;
        }
        const result = runBacktest(lumpSum, prices, { dividends: { AAA: exDates.map((date) => ({ date, amount: 0.25 })) } });

        expect(result.dividendTotal).toBe(Math.round(received * 100) / 100);
        expect(result.finalValue).toBe(Math.round(shares * prices.AAA.at(-1)!.close * 100) / 100);
    });
});

describe("effet du change (D3)", () => {
    const usd = { AAA: [{ date: "2024-01-02", close: 100 }, { date: "2024-01-03", close: 110 }] };
    // 1 € = 1,25 $ puis 1,10 $ : le dollar gagne face à l'euro
    const fxRates = { "EURUSD=X": [{ date: "2024-01-02", close: 1.25 }, { date: "2024-01-03", close: 1.1 }] };

    test("un actif en USD est converti au taux du jour ; returnBreakdown.fx = rendement EUR − rendement local", () => {
        const result = runBacktest(lumpSum, usd, { currencies: { AAA: "USD" }, fxRates });

        // 1000 / (100 / 1,25) = 12,5 titres, puis 12,5 × 110 / 1,1 = 1250 €
        expect(result.finalValue).toBe(1250);
        expect(result.totalReturn).toBe(0.25);
        // Rendement local : +10 % ; contribution du change : 25 % − 10 %
        expect(result.returnBreakdown).toEqual({ price: 0.1, dividends: 0, local: 0.1, fx: 0.15 });
    });

    test("un actif en EUR n'a pas de contribution du change", () => {
        const result = runBacktest(lumpSum, usd, { currencies: { AAA: "EUR" } });

        expect(result.returnBreakdown.fx).toBeNull();
        expect(result.totalReturn).toBe(0.1);
    });

    test("le dividende en dollars est converti au taux de son ex-date", () => {
        const result = runBacktest(lumpSum, usd, { currencies: { AAA: "USD" }, fxRates, dividends: { AAA: [{ date: "2024-01-03", amount: 1.1 }] } });

        // 12,5 titres × 1,1 $ / 1,1 = 12,5 €
        expect(result.dividendTotal).toBe(12.5);
    });

    test("taux manquant : NO_MARKET_DATA sur la paire", () => {
        expect(() => runBacktest(lumpSum, usd, { currencies: { AAA: "USD" } })).toThrow("No market data for EURUSD=X");
    });
});

