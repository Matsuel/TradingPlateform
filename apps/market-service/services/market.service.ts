import type { Period } from "../interfaces/market.interface";
import MarketRepository, { type IMarketRepository } from "../repositories/market.repository";


class MarketService {

    repo: IMarketRepository = new MarketRepository()

    async searchMarket(query: string) {
        return this.repo.search(query)
    }

    async getMarketDetails(id: string, period: Period) {
        return this.repo.getDetails(id, period)
    }

    async getDefaultsMarketAssets() {
        return this.repo.getDefaultAssets()
    }
}

export default MarketService;
