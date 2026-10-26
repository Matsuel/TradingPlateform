import { Logger } from "@trading-plateform/utils";
import ForbiddenError from "../errors/forbidden.error";
import NotFoundError from "../errors/notfound.error";
import type { IBacktestRepository } from "../repositories/backtest.repository";
import BacktestRepository from "../repositories/backtest.repository";

const logger = Logger.here()

class BacktestService {
    repo: IBacktestRepository = new BacktestRepository()

    async getById(id: string, userId: string) {
        logger.info("Fetching backtest", { id, userId })
        const backtest = await this.repo.getById(userId, id)
        if (!backtest) throw new NotFoundError("Backtest not found")
        if (backtest.userId !== userId) throw new ForbiddenError("Access denied")
        return backtest
    }

    async getAll(userId: string) {
        logger.info("Fetching all backtest", { userId })
        const result = await this.repo.getAllByUserId(userId)
        logger.info("Backtests fetched", { userId, count: result.count })
        return result
    }
}

export default BacktestService