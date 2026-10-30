import YahooFinance from "yahoo-finance2";
import type { PricePoint, PriceSeries } from "../interfaces/backtest.interface";

export interface IMarketRepository {
    getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries>;
}

class MarketRepository implements IMarketRepository {

    private static yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

    /**
     * Cours de clôture journaliers de chaque symbole entre `start` et `end` (yahoo-finance2), triés par date.
     * Clôtures ajustées des splits, pas des dividendes ; jours sans clôture écartés.
     */
    async getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries> {
        const series = await Promise.all(
            symbols.map(async (symbol) => {
                const chart = await MarketRepository.yahooFinance.chart(symbol, {
                    period1: start,
                    period2: end,
                    interval: "1d",
                });

                // Jour de cotation dans le fuseau de la place : en UTC, Tokyo ou Sydney tomberaient la veille
                const toDay = new Intl.DateTimeFormat("en-CA", { timeZone: chart.meta.exchangeTimezoneName });
                const points: PricePoint[] = chart.quotes
                    .filter((quote) => quote.close != null)
                    .map((quote) => ({
                        date: toDay.format(quote.date),
                        close: quote.close!,
                    }));

                return [symbol, points] as const;
            }),
        );

        return Object.fromEntries(series);
    }
}

export default MarketRepository;
