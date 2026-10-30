import type { MarketAsset, Paginated, PaginationQuery, Period } from "@trading-plateform/contracts";
import MarketRepository, { type IMarketRepository } from "../repositories/market.repository";
import { DEFAULT_TICKERS } from "../constants/market.constants";


class MarketService {

    repo: IMarketRepository = new MarketRepository()

    async searchMarket(query: string) {
        return this.repo.search(query)
    }

    async getMarketDetails(id: string, period: Period) {
        return this.repo.getDetails(id, period)
    }

    // Pagine la liste DEFAULT_TICKERS avant l'appel Yahoo : seuls les symboles de la page sont interrogés
    async getDefaultsMarketAssets({ page, pageSize }: PaginationQuery): Promise<Paginated<MarketAsset>> {
        const start = (page - 1) * pageSize
        const symbols = DEFAULT_TICKERS.slice(start, start + pageSize)

        const data = await this.repo.getAssets(symbols)

        return { data, count: DEFAULT_TICKERS.length, page, pageSize }
    }
}

export default MarketService;
