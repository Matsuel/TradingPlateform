import { Logger } from "@trading-plateform/utils";
import type { BacktestRequestedPayload } from "@trading-plateform/contracts";
import runBacktest from "../engine/backtest.engine";
import type { IBacktestPublisher } from "../publishers/backtest.publisher";
import MarketRepository, { type IMarketRepository } from "../repositories/market.repository";

const logger = Logger.here();

class BacktestService {
    repo: IMarketRepository = new MarketRepository();

    constructor(private readonly publisher: IBacktestPublisher) { }

    async run(request: BacktestRequestedPayload): Promise<void> {
        const { executionId } = request;

        logger.info("Backtest started", { executionId, symbols: request.symbols });
        await this.publisher.started({ executionId, startedAt: new Date().toISOString() });

        try {
            const prices = await this.repo.getDailyCloses(
                request.symbols,
                new Date(request.startDate),
                new Date(request.endDate),
            );
            const outcome = runBacktest(request, prices);

            await this.publisher.completed({ executionId, finishedAt: new Date().toISOString(), ...outcome });
            logger.info("Backtest completed", { executionId, finalValue: outcome.finalValue });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error("Backtest failed", { executionId, error: message });
            await this.publisher.failed({ executionId, finishedAt: new Date().toISOString(), error: message });
        }
    }
}

export default BacktestService;
