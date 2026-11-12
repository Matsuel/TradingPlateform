import type { DailyCloses, MarketAsset, Paginated, PaginationQuery, Period } from "@trading-plateform/contracts";
import MarketRepository, { type IMarketRepository } from "../repositories/market.repository";
import { ASSETS_CACHE_TTL_MS, DEFAULT_TICKERS, DETAILS_CACHE_TTL_MS, SEARCH_CACHE_TTL_MS } from "../constants/market.constants";
import { TtlCache } from "../utils/cache";


class MarketService {

    repo: IMarketRepository = new MarketRepository()

    // Les réponses du fournisseur sont gardées quelques minutes (durées dans `market.constants.ts`) : Yahoo limite les appels répétés
    private cache = new TtlCache()

    async searchMarket(query: string) {
        return this.cache.getOrLoad(`search:${query.toLowerCase()}`, SEARCH_CACHE_TTL_MS, () => this.repo.search(query))
    }

    async getMarketDetails(id: string, period: Period) {
        return this.cache.getOrLoad(`details:${id}:${period}`, DETAILS_CACHE_TTL_MS[period], () => this.repo.getDetails(id, period))
    }

    // Pagine la liste DEFAULT_TICKERS avant l'appel Yahoo : seuls les symboles de la page sont interrogés
    async getDefaultsMarketAssets({ page, pageSize }: PaginationQuery): Promise<Paginated<MarketAsset>> {
        const start = (page - 1) * pageSize
        const symbols = DEFAULT_TICKERS.slice(start, start + pageSize)

        const data = await this.cache.getOrLoad(`assets:${symbols.join(",")}`, ASSETS_CACHE_TTL_MS, () => this.repo.getAssets(symbols))

        return { data, count: DEFAULT_TICKERS.length, page, pageSize }
    }

    // Jamais mis en cache : un backtest publie l'empreinte et l'instant de récupération de ces cours (reproductibilité)
    async getDailyCloses(symbols: string[], start: Date, end: Date): Promise<DailyCloses> {
        return this.repo.getDailyCloses(symbols, start, end)
    }
}

export default MarketService;
