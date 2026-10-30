import type { EquityPoint, Trade, TradeSide } from "@trading-plateform/contracts";
import BacktestError from "../errors/backtest.error";
import type { BacktestOutcome, BacktestParams, PriceSeries, TwrPoint } from "../interfaces/backtest.interface";
import { annualizedReturn, annualizedVolatility, createDrawdownTracker, periodKey, round, sharpeRatio } from "./backtest.utils";

type Simulation = Omit<BacktestOutcome, "lumpSumComparison" | "benchmark" | "executionRule">;

const roundOrNull = (ratio: number | null) => (ratio === null ? null : round(ratio, 6));

/** Écart stratégie − benchmark arrondi comme un ratio ; null si l'une des deux métriques est null. */
const excess = (strategy: number | null, benchmark: number | null) =>
    strategy === null || benchmark === null ? null : round(strategy - benchmark, 6);

// Écart minimal à la cible, devise saisie, pour passer un ordre de rebalancement : un ordre arrondi à 0 € serait invalide (amount > 0)
const MIN_REBALANCE_ORDER = 0.01;

/**
 * Simule un portefeuille aux poids cibles de `allocations`, jour de cotation par jour de cotation.
 *
 * - Calendrier : jours de cotation de `calendarSymbols` (les symboles de l'allocation et ceux des simulations à aligner
 *   sur elle, comme le benchmark) ; deux simulations au même calendrier ont exactement les mêmes dates.
 * - Départ : premier jour où tous les symboles du calendrier ont un cours ; un cours manquant est reporté du dernier jour connu.
 * - Versements : `initialAmount` le premier jour, puis `recurringAmount` au premier jour de chaque période (DCA).
 * - Exécution : achat au cours de clôture du jour du versement, réparti selon `weight` (ratio, somme = 1),
 *   frais prélevés sur chaque ordre : 10 000 € en 60/40 ⇒ ordres de 6 000 € et 4 000 €, frais compris.
 * - Rebalancement (D7) : au premier jour de cotation de chaque période de `rebalanceFrequency`, hors premier jour,
 *   après le versement du jour. Écarts mesurés au cours du jour sur la valeur V : chaque ligne au-dessus de
 *   `weight × V` est vendue jusqu'à sa cible ; le produit net des ventes est réparti entre les lignes sous leur cible,
 *   au prorata de leur écart. Autofinancé : aucun apport, `totalInvested` inchangé ; les frais de vente et d'achat
 *   réduisent la valeur, donc les lignes achetées finissent sous leur cible d'environ 2 × `feeRate` de leur écart.
 *   `NONE` : aucune vente.
 * - Frais (D8) : `amount × feeRate` sur chaque ordre. Achat : `amount` payé frais compris, titres = (amount − fee) / cours.
 *   Vente : `amount` = produit brut (titres × cours), encaissé net de `fee`.
 * - Métriques de risque (D3 à D6) et `drawdown` de chaque point : sur l'indice TWR chaîné jour après jour,
 *   rendement du jour mesuré avant le versement, donc hors apports.
 *
 * Lève `BacktestError` si un symbole du calendrier n'a pas de données de marché ou si rien n'a été investi.
 */
function simulate(params: BacktestParams, prices: PriceSeries, calendarSymbols: string[]): Simulation {
    const { allocations, investmentMode, initialAmount, recurringAmount, investmentFrequency, rebalanceFrequency, feeRate } = params;
    const symbols = allocations.map((allocation) => allocation.symbol);

    const closes = new Map<string, Map<string, number>>();
    for (const symbol of calendarSymbols) {
        const series = prices[symbol] ?? [];
        if (series.length === 0) throw new BacktestError(`No market data for ${symbol}`);
        closes.set(symbol, new Map(series.map((point) => [point.date, point.close])));
    }

    // Début de la simulation : premier jour où tous les symboles du calendrier ont un cours
    const start = calendarSymbols.map((symbol) => prices[symbol]![0]!.date).sort().at(-1)!;
    const dates = [...new Set(calendarSymbols.flatMap((symbol) => prices[symbol]!.map((point) => point.date)))].sort();

    const lastClose = new Map<string, number>();
    const shares = new Map<string, number>(symbols.map((symbol) => [symbol, 0]));
    const equityCurve: EquityPoint[] = [];
    const trades: Trade[] = [];
    const recurring = investmentMode === "RECURRING" ? recurringAmount ?? 0 : 0;
    const portfolioValue = () => symbols.reduce((sum, symbol) => sum + shares.get(symbol)! * lastClose.get(symbol)!, 0);
    const drawdown = createDrawdownTracker(start);
    const twr: TwrPoint[] = [];
    // Cumuls non arrondis : seules les valeurs publiées le sont
    let invested = 0;
    let fees = 0;
    let rebalances = 0;
    let previousPeriod: string | null = null;
    let previousRebalancePeriod: string | null = null;
    let previousValue = 0;

    /** Exécute un ordre au dernier cours connu et renvoie le montant net de frais (investi pour un achat, encaissé pour une vente). */
    const placeOrder = (date: string, symbol: string, side: TradeSide, amount: number) => {
        const fee = amount * feeRate;
        const price = lastClose.get(symbol)!;
        const quantity = side === "BUY" ? (amount - fee) / price : amount / price;
        shares.set(symbol, shares.get(symbol)! + (side === "BUY" ? quantity : -quantity));
        fees += fee;
        trades.push({
            date,
            symbol,
            side,
            price: round(price, 4),
            quantity: round(quantity, 6),
            amount: round(amount, 2),
            fee: round(fee, 2),
        });
        return amount - fee;
    };

    for (const date of dates) {
        for (const symbol of calendarSymbols) {
            const close = closes.get(symbol)!.get(date);
            if (close !== undefined) lastClose.set(symbol, close);
        }
        if (date < start) continue;

        // Rendement du jour mesuré avant le versement : un apport n'est pas une performance
        const dailyReturn = previousValue > 0 ? portfolioValue() / previousValue : 1;
        const currentDrawdown = previousValue > 0 ? drawdown.record(dailyReturn, date) : 0;
        twr.push({ date, index: (twr.at(-1)?.index ?? 1) * dailyReturn });

        const period = periodKey(date, investmentFrequency);
        const isFirstDay = previousPeriod === null;
        const contribution =
            (isFirstDay ? initialAmount : 0) +
            (period !== previousPeriod ? recurring : 0);
        previousPeriod = period;

        if (contribution > 0) {
            for (const { symbol, weight } of allocations) placeOrder(date, symbol, "BUY", contribution * weight);
            invested += contribution;
        }

        // Date connue à l'avance (premier jour de la période) : décision planifiée, sans look-ahead
        const rebalancePeriod = rebalanceFrequency === "NONE" ? null : periodKey(date, rebalanceFrequency);
        const isRebalanceDay = !isFirstDay && rebalancePeriod !== previousRebalancePeriod;
        previousRebalancePeriod = rebalancePeriod;

        if (isRebalanceDay) {
            const value = portfolioValue();
            // Écart à la cible, devise saisie : > 0 ligne surpondérée, < 0 sous-pondérée
            const gaps = allocations.map(({ symbol, weight }) => ({
                symbol,
                gap: shares.get(symbol)! * lastClose.get(symbol)! - weight * value,
            }));
            const overweight = gaps.filter(({ gap }) => gap >= MIN_REBALANCE_ORDER);
            const underweight = gaps.filter(({ gap }) => -gap >= MIN_REBALANCE_ORDER);

            if (overweight.length > 0 && underweight.length > 0) {
                let proceeds = 0;
                for (const { symbol, gap } of overweight) proceeds += placeOrder(date, symbol, "SELL", gap);
                const shortfall = underweight.reduce((sum, { gap }) => sum - gap, 0);
                for (const { symbol, gap } of underweight) placeOrder(date, symbol, "BUY", (proceeds * -gap) / shortfall);
                rebalances++;
            }
        }

        previousValue = portfolioValue();
        equityCurve.push({ date, value: round(previousValue, 2), invested: round(invested, 2), drawdown: round(currentDrawdown, 6) });
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
        rebalanceCount: rebalances,
        maxDrawdown: round(drawdown.maxDrawdown, 6),
        maxDrawdownDate: drawdown.maxDrawdownDate,
        maxDrawdownPeakDate: drawdown.maxDrawdownPeakDate,
        maxDrawdownRecoveryDate: drawdown.maxDrawdownRecoveryDate,
        recoveryDays: drawdown.recoveryDays,
        cagr: roundOrNull(annualizedReturn(twr)),
        volatility: roundOrNull(annualizedVolatility(twr)),
        sharpeRatio: roundOrNull(sharpeRatio(twr)),
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
 * Point d'entrée de l'engine : simule le backtest demandé, le compare en DCA à un investissement unique
 * et, si `benchmarkSymbol` est renseigné, au benchmark.
 *
 * La comparaison rejoue le même total versé en un seul achat au premier jour : même capital, même période,
 * mêmes frais, seule la répartition dans le temps change. Sa valeur quotidienne est ajoutée à chaque point
 * de la courbe (`lumpSumValue`) ; ses métriques finales vont dans `lumpSumComparison`.
 * Hors DCA, `lumpSumComparison` vaut null et la courbe n'a pas de `lumpSumValue`.
 *
 * Le benchmark (D9) rejoue les mêmes versements, dates et frais à 100 % sur `benchmarkSymbol`, sans rebalancement.
 * Toutes les simulations partagent le calendrier stratégie + benchmark : même départ, mêmes dates, courbes alignées
 * par indice. Sa valeur quotidienne va dans `benchmarkValue`, ses métriques et les écarts stratégie − benchmark
 * dans `benchmark`. Sans benchmark, `benchmark` vaut null et la courbe n'a pas de `benchmarkValue`.
 * Lève `BacktestError` « No market data for <symbol> » si le benchmark n'a aucun cours.
 */
export default function runBacktest(params: BacktestParams, prices: PriceSeries): BacktestOutcome {
    const { benchmarkSymbol } = params;
    const calendarSymbols = [...new Set([...params.allocations.map((allocation) => allocation.symbol), ...(benchmarkSymbol ? [benchmarkSymbol] : [])])];
    const outcome = simulate(params, prices, calendarSymbols);
    // Seule règle du MVP : chaque versement est planifié, donc exécuté à la clôture du jour de l'échéance (README, look-ahead bias)
    const executionRule = "CLOSE_ON_SCHEDULED_DAY";

    const lumpSum =
        params.investmentMode === "RECURRING"
            ? simulate(
                  {
                      ...params,
                      investmentMode: "LUMP_SUM",
                      initialAmount: outcome.totalInvested,
                      recurringAmount: null,
                      investmentFrequency: null,
                  },
                  prices,
                  calendarSymbols,
              )
            : null;

    const benchmark = benchmarkSymbol
        ? simulate({ ...params, allocations: [{ symbol: benchmarkSymbol, weight: 1 }], rebalanceFrequency: "NONE" }, prices, calendarSymbols)
        : null;

    return {
        ...outcome,
        executionRule,
        // Même calendrier, même départ : les courbes ont exactement les mêmes dates, alignées par indice
        equityCurve: outcome.equityCurve.map((point, i) => ({
            ...point,
            ...(lumpSum && { lumpSumValue: lumpSum.equityCurve[i]!.value }),
            ...(benchmark && { benchmarkValue: benchmark.equityCurve[i]!.value }),
        })),
        lumpSumComparison: lumpSum && {
            finalValue: lumpSum.finalValue,
            totalReturn: lumpSum.totalReturn,
            maxDrawdown: lumpSum.maxDrawdown,
            dcaAdvantage: round(outcome.finalValue - lumpSum.finalValue, 2),
        },
        benchmark: benchmark && {
            symbol: benchmarkSymbol!,
            finalValue: benchmark.finalValue,
            totalReturn: benchmark.totalReturn,
            cagr: benchmark.cagr,
            volatility: benchmark.volatility,
            sharpeRatio: benchmark.sharpeRatio,
            maxDrawdown: benchmark.maxDrawdown,
            recoveryDays: benchmark.recoveryDays,
            excessCagr: excess(outcome.cagr, benchmark.cagr),
            excessVolatility: excess(outcome.volatility, benchmark.volatility),
            excessMaxDrawdown: round(outcome.maxDrawdown - benchmark.maxDrawdown, 6),
            excessSharpe: excess(outcome.sharpeRatio, benchmark.sharpeRatio),
        },
    };
}
