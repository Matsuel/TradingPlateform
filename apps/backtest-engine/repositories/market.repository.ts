import { dailyClosesSchema, INTERNAL_KEY_HEADER, PRICE_DATA_SOURCE, type DataSource } from "@trading-plateform/contracts";
import { MARKET_SERVICE_TIMEOUT_MS } from "../constants/market.constants";
import { env } from "../env";
import type { PriceSeries } from "../interfaces/backtest.interface";

export interface IMarketRepository {
    // Fournisseur et type de cours renvoyés par getDailyCloses, publiés avec le résultat
    readonly source: Pick<DataSource, "provider" | "priceType">;
    getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries>;
}

class MarketRepository implements IMarketRepository {

    readonly source = PRICE_DATA_SOURCE;

    /**
     * Cours de clôture journaliers de chaque symbole entre `start` et `end`, lus auprès de market-service (`GET /api/market/closes`),
     * seul service qui appelle le fournisseur. Triés par date, ajustés des splits, pas des dividendes ; jours sans clôture écartés.
     * Lève une erreur si market-service est injoignable ou répond hors 2xx (symbole inconnu compris).
     */
    async getDailyCloses(symbols: string[], start: Date, end: Date): Promise<PriceSeries> {
        const url = new URL("/api/market/closes", env.MARKET_SERVICE_URL);
        url.search = new URLSearchParams({
            symbols: symbols.join(","),
            start: start.toISOString(),
            end: end.toISOString(),
        }).toString();

        const response = await fetch(url, {
            headers: { [INTERNAL_KEY_HEADER]: env.INTERNAL_API_KEY },
            signal: AbortSignal.timeout(MARKET_SERVICE_TIMEOUT_MS),
        });
        if (!response.ok) throw new Error(`Market data unavailable (market-service responded ${response.status})`);

        return dailyClosesSchema.parse(await response.json());
    }
}

export default MarketRepository;
