import NotFoundError from "../errors/notfound.error"
import ForbiddenError from "../errors/forbidden.error"
import PortfolioRepository, { type IPortfolioRepository } from "../repositories/portfolio.repository"
import type { Paginated, PaginationQuery } from "@trading-plateform/contracts"
import type { Portfolio } from "../generated/prisma/client"
import type { PortfolioInput } from "../interfaces/portfolio.interface"
import { Logger } from "@trading-plateform/utils"

const logger = Logger.here()

class PortfolioService {
    repo: IPortfolioRepository = new PortfolioRepository()

    async create(userId: string, input: PortfolioInput) {
        logger.info("Creating portfolio", { userId, name: input.name })
        const portfolio = await this.repo.create({ userId, name: input.name })
        logger.info("Portfolio created", { id: portfolio.id, userId, name: input.name })
        return portfolio
    }

    async getById(id: string, userId: string) {
        logger.info("Fetching portfolio", { id, userId })
        return this.assertOwner(await this.repo.getById(id), userId)
    }

    async getAll(userId: string, pagination: PaginationQuery): Promise<Paginated<Portfolio>> {
        logger.info("Fetching all portfolios", { userId, ...pagination })
        const result = await this.repo.getAllByUserId(userId, pagination)
        logger.info("Portfolios fetched", { userId, count: result.count })
        return { ...result, ...pagination }
    }

    async update(id: string, userId: string, input: PortfolioInput) {
        logger.info("Updating portfolio", { id, userId, fields: Object.keys(input) })
        this.assertOwner(await this.repo.getById(id), userId)
        const updated = await this.repo.update(id, { name: input.name })
        logger.info("Portfolio updated", { id, userId })
        return updated
    }

    async delete(id: string, userId: string) {
        logger.info("Deleting portfolio", { id, userId })
        this.assertOwner(await this.repo.getById(id), userId)
        await this.repo.delete(id)
        logger.info("Portfolio deleted", { id, userId })
    }

    private assertOwner(portfolio: Portfolio | null, userId: string): Portfolio {
        if (!portfolio) throw new NotFoundError("Portfolio not found")
        if (portfolio.userId !== userId) throw new ForbiddenError("Access denied")
        return portfolio
    }
}

export default PortfolioService