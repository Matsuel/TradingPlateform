import type { EquityPoint } from "@trading-plateform/contracts";
import { periodKey } from "@trading-plateform/utils";
import { foreignCurrencies, toReferenceCurrency } from "./backtest.fx";
import { createPortfolio } from "./backtest.portfolio";
import BacktestError from "../errors/backtest.error";
import type { BacktestOutcome, BacktestParams, Currencies, DividendSeries, MarketInput, PriceSeries, TwrPoint } from "../interfaces/backtest.interface";
import { annualizedReturn, annualizedVolatility, createDrawdownTracker, RISK_FREE_RATE, round, sharpeRatio } from "./backtest.utils";

type Simulation = Omit<BacktestOutcome, "lumpSumComparison" | "benchmark" | "executionRule" | "riskFreeRate" | "returnBreakdown" | "priceReturn" | "dividendGain">;

const roundOrNull = (ratio: number | null) => (ratio === null ? null : round(ratio, 6));

/** Écart stratégie − benchmark arrondi comme un ratio ; null si l'une des deux métriques est null. */
const excess = (strategy: number | null, benchmark: number | null) =>
    strategy === null || benchmark === null ? null : round(strategy - benchmark, 6);

/**
 * Calendrier partagé par les simulations d'un backtest : jours de cotation des symboles de l'allocation (`YYYY-MM-DD`,
 * triés), à partir du premier jour où l'allocation et `alignedSymbols` (le benchmark) ont tous un cours. Les jours où seul
 * le benchmark cote n'en font pas partie : ils ajouteraient à la stratégie des points plats qui baisseraient sa volatilité.
 * Le benchmark peut donc retarder le départ de la stratégie (premier cours du benchmark postérieur au sien).
 *
 * Lève `BacktestError` « No market data for <symbol> » si un symbole n'a aucun cours.
 */
function buildCalendar(prices: PriceSeries, strategySymbols: string[], alignedSymbols: string[]): string[] {
    const firstDates = [...strategySymbols, ...alignedSymbols].map((symbol) => {
        const first = prices[symbol]?.[0];
        if (!first) throw new BacktestError("NO_MARKET_DATA", `No market data for ${symbol}`);
        return first.date;
    });
    const start = firstDates.sort().at(-1)!;
    return [...new Set(strategySymbols.flatMap((symbol) => prices[symbol]!.map((point) => point.date)))].filter((date) => date >= start).sort();
}

/**
 * Simule un portefeuille aux poids cibles de `allocations`, jour de cotation par jour de cotation.
 *
 * - Calendrier : `dates` (`buildCalendar`) ; deux simulations au même calendrier ont exactement les mêmes dates.
 *   Un cours manquant un jour du calendrier est reporté du dernier jour connu.
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
 * - Dividendes (D1) : crédités à l'ex-date sur les titres détenus, réinvestis au cours de l'ex-date sans frais (ex-date hors calendrier :
 *   créditée au premier jour de cotation suivant, à son cours) ;
 *   le total perçu est publié (`dividendTotal`), la valeur du portefeuille et `totalReturn` les incluent.
 * - Métriques de risque (D3 à D6) et `drawdown` de chaque point : sur l'indice TWR chaîné jour après jour,
 *   rendement du jour mesuré avant le versement, donc hors apports.
 *
 * Lève `BacktestError` si rien n'a été investi (calendrier vide).
 */
function simulate(params: BacktestParams, { prices, dividends }: MarketInput, dates: string[]): Simulation {
    const { investmentMode, initialAmount, recurringAmount, investmentFrequency, rebalanceFrequency } = params;
    const portfolio = createPortfolio(params, prices, dividends);
    const equityCurve: EquityPoint[] = [];
    const drawdown = createDrawdownTracker(dates[0]);
    const twr: TwrPoint[] = [];
    // Cumuls non arrondis : seules les valeurs publiées le sont
    let invested = 0;
    let rebalances = 0;
    let previousPeriod: string | null = null;
    let previousRebalancePeriod: string | null = null;
    let previousValue = 0;

    for (const date of dates) {
        portfolio.advance(date);

        // Rendement du jour mesuré avant le versement : un apport n'est pas une performance
        const dailyReturn = previousValue > 0 ? portfolio.value() / previousValue : 1;
        const currentDrawdown = previousValue > 0 ? drawdown.record(dailyReturn, date) : 0;
        twr.push({ date, index: (twr.at(-1)?.index ?? 1) * dailyReturn });

        const period = periodKey(date, investmentFrequency);
        const isFirstDay = previousPeriod === null;
        const recurring = investmentMode === "RECURRING" && period !== previousPeriod ? recurringAmount ?? 0 : 0;
        const contribution = (isFirstDay ? initialAmount : 0) + recurring;
        previousPeriod = period;

        if (contribution > 0) {
            portfolio.invest(date, contribution);
            invested += contribution;
        }

        // Date connue à l'avance (premier jour de la période) : décision planifiée, sans look-ahead
        const rebalancePeriod = rebalanceFrequency === "NONE" ? null : periodKey(date, rebalanceFrequency);
        const isRebalanceDay = !isFirstDay && rebalancePeriod !== previousRebalancePeriod;
        previousRebalancePeriod = rebalancePeriod;

        if (isRebalanceDay && portfolio.rebalance(date)) rebalances++;

        previousValue = portfolio.value();
        equityCurve.push({ date, value: round(previousValue, 2), invested: round(invested, 2), drawdown: round(currentDrawdown, 6) });
    }

    if (invested === 0) throw new BacktestError("NOTHING_INVESTED", "Nothing was invested");

    const finalValue = equityCurve.at(-1)!.value;

    return {
        finalValue,
        totalInvested: round(invested, 2),
        totalFees: round(portfolio.fees, 2),
        profit: round(finalValue - invested, 2),
        totalReturn: round((finalValue - invested) / invested, 6),
        dividendTotal: round(portfolio.dividendTotal, 2),
        dividendEvents: portfolio.dividendEvents,
        totalTrades: portfolio.trades.length,
        rebalanceCount: rebalances,
        ...riskMetrics(drawdown, twr),
        equityCurve,
        trades: portfolio.trades,
        holdings: portfolio.holdings(),
    };
}

/** Métriques de risque et de rendement annualisé, calculées sur l'indice TWR (D3 à D6) et le suivi de drawdown. */
function riskMetrics(drawdown: ReturnType<typeof createDrawdownTracker>, twr: TwrPoint[]) {
    return {
        maxDrawdown: round(drawdown.maxDrawdown, 6),
        maxDrawdownDate: drawdown.maxDrawdownDate,
        maxDrawdownPeakDate: drawdown.maxDrawdownPeakDate,
        maxDrawdownRecoveryDate: drawdown.maxDrawdownRecoveryDate,
        recoveryDays: drawdown.recoveryDays,
        cagr: roundOrNull(annualizedReturn(twr)),
        volatility: roundOrNull(annualizedVolatility(twr)),
        sharpeRatio: roundOrNull(sharpeRatio(twr)),
    };
}

/**
 * Simule le backtest demandé sur un marché déjà en euros (`runBacktest` prépare ce marché), le compare en DCA
 * à un investissement unique et, si `benchmarkSymbol` est renseigné, au benchmark.
 *
 * La comparaison rejoue le même total versé en un seul achat au premier jour : même capital, même période,
 * mêmes frais, seule la répartition dans le temps change. Sa valeur quotidienne est ajoutée à chaque point
 * de la courbe (`lumpSumValue`) ; ses métriques finales vont dans `lumpSumComparison`.
 * Hors DCA, `lumpSumComparison` vaut null et la courbe n'a pas de `lumpSumValue`.
 *
 * Le benchmark (D9) rejoue les mêmes versements, dates et frais à 100 % sur `benchmarkSymbol`, sans rebalancement.
 * Toutes les simulations partagent le calendrier de la stratégie (`buildCalendar`) : même départ, mêmes dates, courbes
 * alignées par indice ; un jour sans cotation du benchmark reporte son dernier cours. Sa valeur quotidienne va dans `benchmarkValue`, ses métriques et les écarts stratégie − benchmark
 * dans `benchmark`. Sans benchmark, `benchmark` vaut null et la courbe n'a pas de `benchmarkValue`.
 * Lève `BacktestError` « No market data for <symbol> » si le benchmark n'a aucun cours.
 */
function runOnMarket(params: BacktestParams, market: MarketInput): Omit<BacktestOutcome, "returnBreakdown" | "priceReturn" | "dividendGain"> {
    const { prices } = market;
    const { benchmarkSymbol } = params;
    const calendar = buildCalendar(prices, params.allocations.map((allocation) => allocation.symbol), benchmarkSymbol ? [benchmarkSymbol] : []);
    const outcome = simulate(params, market, calendar);
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
                  market,
                  calendar,
              )
            : null;

    const benchmark = benchmarkSymbol
        ? simulate({ ...params, allocations: [{ symbol: benchmarkSymbol, weight: 1 }], rebalanceFrequency: "NONE" }, market, calendar)
        : null;

    return {
        ...outcome,
        executionRule,
        riskFreeRate: RISK_FREE_RATE,
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

/** Données d'entrée facultatives de `runBacktest` : sans elles, les cours sont déjà en euros et sans dividende. */
export interface MarketExtras {
    dividends?: DividendSeries;
    // Devise de cotation de chaque symbole de `prices` ; un symbole absent cote en euros
    currencies?: Currencies;
    // Séries journalières des paires `EURxxx=X` (unités de devise pour 1 €), une par devise étrangère
    fxRates?: PriceSeries;
}

/**
 * Point d'entrée de l'engine : simule le backtest sur des cours convertis en euros au taux du jour (D3), dividendes
 * réinvestis (D1) ; voir `runOnMarket` pour le calendrier, la comparaison DCA et le benchmark.
 *
 * Rejoue la simulation sans dividendes (`priceReturn`, `priceOnlyValue` de chaque point, publié seulement si un dividende a été
 * perçu) et, hors euro, en devise locale (cours non convertis) : `returnBreakdown` passe du rendement du cours seul au rendement
 * en euros, avec `fx` = rendement en euros − rendement local (null si aucun symbole de l'allocation ne cote hors euro).
 * Lève `BacktestError` « No market data for EURxxx=X » si le taux d'une devise étrangère manque.
 */
export default function runBacktest(params: BacktestParams, prices: PriceSeries, { dividends = {}, currencies = {}, fxRates = {} }: MarketExtras = {}): BacktestOutcome {
    const local: MarketInput = { prices, dividends };
    const foreign = foreignCurrencies(params.allocations.map((allocation) => allocation.symbol), currencies).length > 0;
    const converted = toReferenceCurrency(local, currencies, fxRates);
    const withoutDividends = (market: MarketInput): MarketInput => ({ ...market, dividends: {} });
    const outcome = runOnMarket(params, converted);
    const priceOnly = runOnMarket(params, withoutDividends(converted));
    // Sans devise étrangère, le local est l'euro : pas de simulation de plus
    const localOutcome = foreign ? runOnMarket(params, local) : outcome;
    const localPriceOnly = foreign ? runOnMarket(params, withoutDividends(local)) : priceOnly;

    return {
        ...outcome,
        priceReturn: priceOnly.totalReturn,
        dividendGain: round(outcome.finalValue - priceOnly.finalValue, 2),
        equityCurve:
            outcome.dividendTotal > 0
                ? outcome.equityCurve.map((point, i) => ({ ...point, priceOnlyValue: priceOnly.equityCurve[i]!.value }))
                : outcome.equityCurve,
        returnBreakdown: {
            price: localPriceOnly.totalReturn,
            dividends: round(localOutcome.totalReturn - localPriceOnly.totalReturn, 6),
            local: localOutcome.totalReturn,
            fx: foreign ? round(outcome.totalReturn - localOutcome.totalReturn, 6) : null,
        },
    };
}
