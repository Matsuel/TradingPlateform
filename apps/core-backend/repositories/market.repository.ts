import YahooFinance from "yahoo-finance2";
import type { MarketAsset, MarketData, MarketDetails, Period } from "../interfaces/market.interface";
import { env } from "../env";
import { DEFAULT_TICKERS } from "../constants/market.constants";

export interface IMarketRepository {
    search(query: string): Promise<MarketData[]>
    getDetails(id: string, period: Period): Promise<MarketDetails[]>
    getDefaultAssets(): Promise<MarketAsset[]>;
}

class MarketRepository implements IMarketRepository {

    private static yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey']});

    async search(query: string): Promise<MarketData[]> {
        const results = await MarketRepository.yahooFinance.search(query)

        const formattedResults: MarketData[] = results.quotes.map((quote: any) => ({
            symbol: quote.symbol,
            name: quote.shortname || quote.longname || quote.symbol,
            exchange: quote.exchange,
            assetType: quote.quoteType,
            logoUrl: quote.symbol && env.LOGO_DEV_TOKEN
                ? `https://img.logo.dev/ticker/${quote.symbol}?token=${env.LOGO_DEV_TOKEN}&size=64`
                : undefined,
        }))

        return formattedResults.filter((item) => item.name && item.exchange && item.assetType)
    }

    async getDetails(id: string, period: Period): Promise<MarketDetails[]> {
        const now = new Date()

        const config: Record<Period, { period1: Date, interval: string }> = {
            '1d': { period1: new Date(now.getTime() - 24 * 60 * 60 * 1000), interval: '5m' },
            '1w': { period1: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), interval: '1h' },
            '1m': { period1: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()), interval: '1d' },
            '1y': { period1: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), interval: '1wk' },
            'max': { period1: new Date(0), interval: '1mo' },
        }

        const { period1, interval } = config[period]

        const details = await MarketRepository.yahooFinance.chart(id, {
            period1: period1,
            interval: interval as any,
        })

        if (!details) {
            throw new Error(`No details found for id: ${id}`)
        }

        const formattedResult: MarketDetails[] = details.quotes.map((quote: any) => ({
            date: quote.date,
            price: quote.close,
        }))

        return formattedResult
    }

    /**
     * Récupère les cotations des 15 actifs par défaut.
     * Un actif indisponible ne bloque pas les autres.
     */
    async getDefaultAssets(): Promise<MarketAsset[]> {
        const results = await Promise.allSettled(
            DEFAULT_TICKERS.map(async (symbol) => {
                const [quote, chart] = await Promise.all([
                    MarketRepository.yahooFinance.quote(symbol),
                    MarketRepository.yahooFinance.chart(symbol, {
                        period1: new Date(
                            Date.now() - 24 * 60 * 60 * 1000,
                        ),
                        interval: "1h",
                    }),
                ]);

                const history: MarketDetails[] = chart.quotes
                    .filter((point: any) => point.close != null)
                    .map((point: any) => ({
                        date: point.date,
                        price: point.close,
                    }));

                return {
                    symbol: quote.symbol,
                    name:
                        quote.shortName ??
                        quote.longName ??
                        quote.symbol,
                    price: quote.regularMarketPrice ?? null,
                    change24h:
                        quote.regularMarketChangePercent ?? null,
                    volume24h: quote.regularMarketVolume ?? null,
                    history,
                } satisfies MarketAsset;
            }),
        );

        return results.flatMap((result, index) => {
            if (result.status === "fulfilled") {
                return [result.value];
            }

            console.error(
                `Impossible de récupérer ${DEFAULT_TICKERS[index]}:`,
                result.reason,
            );

            return [];
        });
    }
}

export default MarketRepository;