import type { EquityPoint, Trade } from "@trading-plateform/contracts";
import BacktestError from "../errors/backtest.error";
import type { BacktestOutcome, BacktestParams, PriceSeries } from "../interfaces/backtest.interface";
import { createDrawdownTracker, periodKey, round } from "./backtest.utils";

type Simulation = Omit<BacktestOutcome, "lumpSumComparison">;

/**
 * Simule un portefeuille équipondéré sur les symboles demandés, jour de cotation par jour de cotation.
 *
 * - Départ : premier jour où tous les symboles ont un cours ; un cours manquant est reporté du dernier jour connu.
 * - Versements : `initialAmount` le premier jour, puis `recurringAmount` au premier jour de chaque période (DCA).
 * - Exécution : achat au cours de clôture du jour du versement, réparti à parts égales, frais prélevés sur chaque achat.
 *
 * Lève `BacktestError` sans données de marché ou si rien n'a été investi.
 */
function simulate(params: BacktestParams, prices: PriceSeries): Simulation {
    const { symbols, investmentMode, initialAmount, recurringAmount, investmentFrequency, feeRate } = params;

    const closes = new Map<string, Map<string, number>>();
    for (const symbol of symbols) {
        const series = prices[symbol] ?? [];
        if (series.length === 0) throw new BacktestError(`No market data for ${symbol}`);
        closes.set(symbol, new Map(series.map((point) => [point.date, point.close])));
    }

    // Début de la simulation : premier jour où tous les symboles ont un cours
    const start = symbols.map((symbol) => prices[symbol]![0]!.date).sort().at(-1)!;
    const dates = [...new Set(symbols.flatMap((symbol) => prices[symbol]!.map((point) => point.date)))].sort();

    const lastClose = new Map<string, number>();
    const shares = new Map<string, number>(symbols.map((symbol) => [symbol, 0]));
    const equityCurve: EquityPoint[] = [];
    const trades: Trade[] = [];
    const recurring = investmentMode === "RECURRING" ? recurringAmount ?? 0 : 0;
    const portfolioValue = () => symbols.reduce((sum, symbol) => sum + shares.get(symbol)! * lastClose.get(symbol)!, 0);
    const drawdown = createDrawdownTracker();
    // Cumuls non arrondis : seules les valeurs publiées le sont
    let invested = 0;
    let fees = 0;
    let previousPeriod: string | null = null;
    let previousValue = 0;

    for (const date of dates) {
        for (const symbol of symbols) {
            const close = closes.get(symbol)!.get(date);
            if (close !== undefined) lastClose.set(symbol, close);
        }
        if (date < start) continue;

        // Rendement du jour mesuré avant le versement : un apport n'est pas une performance
        if (previousValue > 0) drawdown.record(portfolioValue() / previousValue, date);

        const period = periodKey(date, investmentFrequency);
        const isFirstDay = previousPeriod === null;
        const contribution =
            (isFirstDay ? initialAmount : 0) +
            (period !== previousPeriod ? recurring : 0);
        previousPeriod = period;

        if (contribution > 0) {
            const amount = contribution / symbols.length;
            const fee = amount * feeRate;
            for (const symbol of symbols) {
                const price = lastClose.get(symbol)!;
                const quantity = (amount - fee) / price;
                shares.set(symbol, shares.get(symbol)! + quantity);
                fees += fee;
                trades.push({
                    date,
                    symbol,
                    price: round(price, 4),
                    quantity: round(quantity, 6),
                    amount: round(amount, 2),
                    fee: round(fee, 2),
                });
            }
            invested += contribution;
        }

        previousValue = portfolioValue();
        equityCurve.push({ date, value: round(previousValue, 2), invested: round(invested, 2) });
    }

    if (invested === 0) throw new BacktestError("Nothing was invested");

    const finalValue = equityCurve.at(-1)!.value;

    return {
        finalValue,
        totalInvested: round(invested, 2),
        totalFees: round(fees, 2),
        profit: round(finalValue - invested, 2),
        totalReturn: round((finalValue - invested) / invested, 6),
        totalTrades: trades.length,
        maxDrawdown: round(drawdown.maxDrawdown, 6),
        maxDrawdownDate: drawdown.maxDrawdownDate,
        equityCurve,
        trades,
        holdings: symbols.map((symbol) => ({
            symbol,
            quantity: round(shares.get(symbol)!, 6),
            value: round(shares.get(symbol)! * lastClose.get(symbol)!, 2),
        })),
    };
}

/**
 * Point d'entrée de l'engine : simule le backtest demandé et, en DCA, le compare à un investissement unique.
 *
 * La comparaison rejoue le même total versé en un seul achat au premier jour : même capital, même période,
 * mêmes frais, seule la répartition dans le temps change. Sa valeur quotidienne est ajoutée à chaque point
 * de la courbe (`lumpSumValue`) ; ses métriques finales vont dans `lumpSumComparison`.
 * Hors DCA, `lumpSumComparison` vaut null et la courbe n'a pas de `lumpSumValue`.
 */
export default function runBacktest(params: BacktestParams, prices: PriceSeries): BacktestOutcome {
    const outcome = simulate(params, prices);
    if (params.investmentMode !== "RECURRING") return { ...outcome, lumpSumComparison: null };

    const lumpSum = simulate(
        {
            ...params,
            investmentMode: "LUMP_SUM",
            initialAmount: outcome.totalInvested,
            recurringAmount: null,
            investmentFrequency: null,
        },
        prices,
    );

    return {
        ...outcome,
        // Mêmes cours, même départ : les deux courbes ont exactement les mêmes dates, alignées par indice
        equityCurve: outcome.equityCurve.map((point, i) => ({ ...point, lumpSumValue: lumpSum.equityCurve[i]!.value })),
        lumpSumComparison: {
            finalValue: lumpSum.finalValue,
            totalReturn: lumpSum.totalReturn,
            maxDrawdown: lumpSum.maxDrawdown,
            dcaAdvantage: round(outcome.finalValue - lumpSum.finalValue, 2),
        },
    };
}
