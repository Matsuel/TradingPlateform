import BadRequestError from "../errors/badrequest.error";
import type { Period } from "../interfaces/market.interface";
import MarketRepository, { type IMarketRepository } from "../repositories/market.repository";


class MarketService {

    repo: IMarketRepository = new MarketRepository()

    async searchMarket(query: string) {
        if (!query || query.trim().length < 2) {
            throw new BadRequestError("Query must be at least 2 characters")
        }
        return this.repo.search(query.trim())
    }

    async getMarketDetails(id: string, period: Period) {
        if (!id || id.trim().length === 0) {
            throw new BadRequestError("Id must be provided")
        }
        return this.repo.getDetails(id.trim(), period)
    }
}

export default MarketService;