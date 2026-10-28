import type { EquityPoint, Trade } from "@trading-plateform/contracts";
import BacktestError from "../errors/backtest.error";
import type { BacktestOutcome, BacktestParams, PriceSeries } from "../interfaces/backtest.interface";

const DAY_MS = 24 * 60 * 60 * 1000;

const round = (value: number, decimals: number) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

// Clé de période : un versement récurrent a lieu au premier jour de cotation de chaque nouvelle période
const periodKey = (date: string, frequency: BacktestParams["investmentFrequency"]) => {
    switch (frequency) {
        case "WEEKLY":
            // 1970-01-01 est un jeudi : +3 jours fait commencer les semaines le lundi
            return String(Math.floor((Date.parse(date) / DAY_MS + 3) / 7));
        case "MONTHLY":
            return date.slice(0, 7);
        case "YEARLY":
            return date.slice(0, 4);
        default:
            return date;
    }
};

/**
 * Simule un portefeuille équipondéré sur les symboles demandés.
 * Les frais sont prélevés sur chaque achat ; les cours manquants sont reportés du dernier jour connu.
 */
export default function runBacktest(params: BacktestParams, prices: PriceSeries): BacktestOutcome {
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
    let invested = 0;
    let previousPeriod: string | null = null;
    // Indice de performance hors versements : le drawdown ne doit pas être masqué par les apports du DCA
    let previousValue = 0;
    let index = 1;
    let peak = 1;
    let maxDrawdown = 0;
    let maxDrawdownDate: string | null = null;

    for (const date of dates) {
        for (const symbol of symbols) {
            const close = closes.get(symbol)!.get(date);
            if (close !== undefined) lastClose.set(symbol, close);
        }
        if (date < start) continue;

        if (previousValue > 0) {
            index *= portfolioValue() / previousValue;
            peak = Math.max(peak, index);
            if (index / peak - 1 < maxDrawdown) {
                maxDrawdown = index / peak - 1;
                maxDrawdownDate = date;
            }
        }

        const period = periodKey(date, investmentFrequency);
        const isFirstDay = previousPeriod === null;
        const contribution =
            (isFirstDay ? initialAmount : 0) +
            (period !== previousPeriod ? recurring : 0);
        previousPeriod = period;

        if (contribution > 0) {
            const perSymbol = contribution / symbols.length;
            for (const symbol of symbols) {
                const price = lastClose.get(symbol)!;
                shares.set(symbol, shares.get(symbol)! + (perSymbol * (1 - feeRate)) / price);
                trades.push({ date, symbol, price: round(price, 4) });
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
        totalReturn: round((finalValue - invested) / invested, 6),
        totalTrades: trades.length,
        maxDrawdown: round(maxDrawdown, 6),
        maxDrawdownDate,
        equityCurve,
        trades,
    };
}
