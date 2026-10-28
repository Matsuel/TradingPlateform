import YahooFinance from "yahoo-finance2";
import type { PricePoint, PriceSeries } from "../interfaces/backtest.interface";

export interface IMarketRepository {
    getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries>;
}

class MarketRepository implements IMarketRepository {

    private static yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

    async getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries> {
        const series = await Promise.all(
            symbols.map(async (symbol) => {
                const chart = await MarketRepository.yahooFinance.chart(symbol, {
                    period1: start,
                    period2: end,
                    interval: "1d",
                });

                const points: PricePoint[] = chart.quotes
                    .filter((quote) => quote.close != null)
                    .map((quote) => ({
                        date: quote.date.toISOString().slice(0, 10),
                        close: quote.close!,
                    }));

                return [symbol, points] as const;
            }),
        );

        return Object.fromEntries(series);
    }
}

export default MarketRepository;
