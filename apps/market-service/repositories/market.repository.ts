import YahooFinance from "yahoo-finance2";
import type { ChartOptions } from "yahoo-finance2/modules/chart";
import type { MarketAsset, MarketData, MarketDetails, Period } from "../interfaces/market.interface";
import { env } from "../env";
import { Logger } from "@trading-plateform/utils";

const logger = Logger.here();

const DAY_MS = 24 * 60 * 60 * 1000;

export interface IMarketRepository {
    search(query: string): Promise<MarketData[]>
    getDetails(id: string, period: Period): Promise<MarketDetails[]>
    getAssets(symbols: string[]): Promise<MarketAsset[]>;
}

class MarketRepository implements IMarketRepository {

    private static yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey']});

    async search(query: string): Promise<MarketData[]> {
        const results = await MarketRepository.yahooFinance.search(query)

        // Les résultats hors Yahoo n'ont ni symbole ni place de cotation : ils seraient filtrés plus bas
        const formattedResults: MarketData[] = results.quotes
            .filter((quote) => quote.isYahooFinance)
            .map((quote) => ({
                symbol: quote.symbol,
                name: quote.shortname || quote.longname || quote.symbol,
                exchange: quote.exchange,
                assetType: quote.quoteType,
                logoUrl: MarketRepository.logoUrl(quote.symbol),
            }))

        return formattedResults.filter((item) => item.name && item.exchange && item.assetType)
    }

    async getDetails(id: string, period: Period): Promise<MarketDetails[]> {
        const now = new Date()

        const config: Record<Period, { period1: Date, interval: ChartOptions["interval"] }> = {
            '1d': { period1: new Date(now.getTime() - DAY_MS), interval: '5m' },
            '1w': { period1: new Date(now.getTime() - 7 * DAY_MS), interval: '1h' },
            '1m': { period1: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()), interval: '1d' },
            '1y': { period1: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), interval: '1wk' },
            'max': { period1: new Date(0), interval: '1mo' },
        }

        const { period1, interval } = config[period]

        const details = await MarketRepository.yahooFinance.chart(id, {
            period1: period1,
            interval: interval,
        })

        if (!details) {
            throw new Error(`No details found for id: ${id}`)
        }

        const formattedResult: MarketDetails[] = details.quotes.map((quote) => ({
            date: quote.date,
            price: quote.close,
        }))

        return formattedResult
    }

    /**
     * Récupère les cotations des symboles demandés, dans leur ordre.
     * Un actif indisponible est omis et ne bloque pas les autres.
     */
    async getAssets(symbols: string[]): Promise<MarketAsset[]> {
        const results = await Promise.allSettled(
            symbols.map(async (symbol) => {
                const [quote, chart] = await Promise.all([
                    MarketRepository.yahooFinance.quote(symbol),
                    MarketRepository.yahooFinance.chart(symbol, {
                        period1: new Date(Date.now() - DAY_MS),
                        interval: "1h",
                    }),
                ]);

                const history: MarketDetails[] = chart.quotes
                    .filter((point) => point.close != null)
                    .map((point) => ({
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
                    logoUrl: MarketRepository.logoUrl(quote.symbol),
                } satisfies MarketAsset;
            }),
        );

        return results.flatMap((result, index) => {
            if (result.status === "fulfilled") {
                return [result.value];
            }

            logger.error(`Impossible de récupérer ${symbols[index]}`, {
                reason: result.reason,
            });

            return [];
        });
    }

    private static logoUrl(symbol: string): string | undefined {
        return symbol && env.LOGO_DEV_TOKEN
            ? `https://img.logo.dev/ticker/${symbol}?token=${env.LOGO_DEV_TOKEN}&size=64`
            : undefined
    }
}

export default MarketRepository;