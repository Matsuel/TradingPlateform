import { dailyClosesSchema, dividendsSchema, INTERNAL_KEY_HEADER, PRICE_DATA_SOURCE, type DataSource, type Dividends } from "@trading-plateform/contracts";
import { MARKET_SERVICE_TIMEOUT_MS, RETRYABLE_STATUSES } from "../constants/market.constants";
import { env } from "../env";
import type { PriceSeries } from "../interfaces/backtest.interface";

export interface IMarketRepository {
    // Fournisseur et type de cours renvoyés par getDailyCloses, publiés avec le résultat
    readonly source: Pick<DataSource, "provider" | "priceType">;
    getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries>;
    getDividends(symbols: string[], start: Date, end: Date): Promise<Dividends>;
}

class MarketRepository implements IMarketRepository {

    readonly source = PRICE_DATA_SOURCE;

    /**
     * Cours de clôture journaliers de chaque symbole entre `start` et `end`, lus auprès de market-service (`GET /api/market/closes`),
     * seul service qui appelle le fournisseur. Triés par date, ajustés des splits, pas des dividendes ; jours sans clôture écartés.
     * Lève une erreur si market-service est injoignable ou répond hors 2xx (symbole inconnu compris).
     */
    async getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries> {
        return dailyClosesSchema.parse(await MarketRepository.read("/api/market/closes", symbols, start, end));
    }

    /**
     * Dividendes et devise de cotation de chaque symbole entre `start` et `end`, lus auprès de market-service
     * (`GET /api/market/dividends`) : triés par date, liste vide sans dividende. Mêmes erreurs que `getDailyCloses`.
     */
    async getDividends(symbols: string[], start: Date, end: Date): Promise<Dividends> {
        return dividendsSchema.parse(await MarketRepository.read("/api/market/dividends", symbols, start, end));
    }

    /** Corps JSON de `path` pour ces symboles et cette période ; lève une erreur si market-service répond hors 2xx. */
    private static async read(path: string, symbols: string[], start: Date, end: Date): Promise<unknown> {
        const url = new URL(path, env.MARKET_SERVICE_URL);
        url.search = new URLSearchParams({
            symbols: symbols.join(","),
            start: start.toISOString(),
            end: end.toISOString(),
        }).toString();

        const response = await MarketRepository.fetchWithRetry(url);
        if (!response.ok) {
            // Le code stable de market-service (`INVALID_QUERY`, `INTERNAL_ERROR`…) situe la cause dans `backtest.failed`
            const body = (await response.json().catch(() => null)) as { code?: string } | null;
            throw new Error(`Market data unavailable (market-service responded ${response.status}${body?.code ? ` ${body.code}` : ""})`);
        }

        return response.json();
    }

    /** Un appel, puis un seul nouvel essai si market-service est injoignable, dépasse le délai ou répond 502/503/504. */
    private static async fetchWithRetry(url: URL): Promise<Response> {
        const call = () =>
            fetch(url, {
                headers: { [INTERNAL_KEY_HEADER]: env.INTERNAL_API_KEY },
                signal: AbortSignal.timeout(MARKET_SERVICE_TIMEOUT_MS),
            });
        const first = await call().catch(() => null);
        return first && !RETRYABLE_STATUSES.includes(first.status) ? first : call();
    }
}

export default MarketRepository;
