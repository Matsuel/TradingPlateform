import { Logger } from "../utils/logger"
import BadRequestError from "../errors/badrequest.error"
import NotFoundError from "../errors/notfound.error"
import ForbiddenError from "../errors/forbidden.error"
import PortfolioRepository, { type IPortfolioRepository } from "../repositories/portfolio.repository"
import type { UpdatePortfolioDTO } from "../interfaces/portfolio.interface"

const logger = Logger.here()

class PortfolioService {
    repo: IPortfolioRepository = new PortfolioRepository()

    async create(userId: string, name: string) {
        if (!name) {
            throw new BadRequestError("Name is required")
        }
        logger.info("Creating portfolio", { userId, name })
        const portfolio = await this.repo.create(userId, { name })
        logger.info("Portfolio created", { id: portfolio.id, userId, name })
        return portfolio
    }

    async getById(id: string, userId: string) {
        logger.info("Fetching portfolio", { id, userId })
        const portfolio = await this.repo.getById(id)
        if (!portfolio) throw new NotFoundError("Portfolio not found")
        if (portfolio.userId !== userId) throw new ForbiddenError("Access denied")
        return portfolio
    }

    async getAll(userId: string) {
        logger.info("Fetching all portfolios", { userId })
        const result = await this.repo.getAllByUserId(userId)
        logger.info("Portfolios fetched", { userId, count: result.count })
        return result
    }

    async update(id: string, userId: string, data: UpdatePortfolioDTO) {
        if (!data.name) {
            throw new BadRequestError("Name is required")
        }
        logger.info("Updating portfolio", { id, userId, fields: Object.keys(data) })
        const portfolio = await this.repo.getById(id)
        if (!portfolio) throw new NotFoundError("Portfolio not found")
        if (portfolio.userId !== userId) throw new ForbiddenError("Access denied")
        const updated = await this.repo.update(id, data)
        logger.info("Portfolio updated", { id, userId })
        return updated
    }

    async delete(id: string, userId: string) {
        logger.info("Deleting portfolio", { id, userId })
        const portfolio = await this.repo.getById(id)
        if (!portfolio) throw new NotFoundError("Portfolio not found")
        if (portfolio.userId !== userId) throw new ForbiddenError("Access denied")
        await this.repo.delete(id)
        logger.info("Portfolio deleted", { id, userId })
    }
}

export default PortfolioService