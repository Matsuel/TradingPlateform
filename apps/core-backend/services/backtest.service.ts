import { Logger } from "@trading-plateform/utils";
import ForbiddenError from "../errors/forbidden.error";
import NotFoundError from "../errors/notfound.error";
import type { IBacktestRepository } from "../repositories/backtest.repository";
import BacktestRepository from "../repositories/backtest.repository";
import type { CreateBacktestInput } from "../interfaces/backtest.interface";

const logger = Logger.here()

class BacktestService {
    repo: IBacktestRepository = new BacktestRepository()

    async create(userId: string, input: CreateBacktestInput) {
        const isDca = input.strategy === "dca"
        const backtest = await this.repo.create({
            userId,
            name: input.name,
            symbols: input.symbols,
            startDate: input.start,
            endDate: input.end,
            investmentMode: isDca ? "RECURRING" : "LUMP_SUM",
            initialAmount: isDca ? 0 : input.amount,
            recurringAmount: isDca ? input.amount : null,
            investmentFrequency: isDca ? "MONTHLY" : null,
            feeRate: input.fee / 100,
        })
        logger.info("Backtest created", { id: backtest.id, userId })
        return backtest
    }

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