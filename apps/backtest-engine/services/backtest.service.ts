import { Logger } from "@trading-plateform/utils";
import type { BacktestRequestedPayload } from "@trading-plateform/contracts";
import runBacktest from "../engine/backtest.engine";
import { fingerprintPrices } from "../engine/backtest.utils";
import type { IBacktestPublisher } from "../publishers/backtest.publisher";
import MarketRepository, { type IMarketRepository } from "../repositories/market.repository";

const logger = Logger.here();

class BacktestService {
    repo: IMarketRepository = new MarketRepository();

    constructor(private readonly publisher: IBacktestPublisher) { }

    /**
     * Exécute un `backtest.requested` : publie `started`, charge les cours, calcule, puis publie `completed`
     * avec la provenance des cours (source, instant de récupération, empreinte) pour rendre le résultat comparable.
     * Toute erreur (données, calcul, publication du résultat) est publiée en `failed` avec sa cause ; rien n'est relancé.
     */
    async run(request: BacktestRequestedPayload): Promise<void> {
        const { executionId } = request;

        logger.info("Backtest started", { executionId, allocations: request.allocations });
        await this.publisher.started({ executionId, startedAt: new Date().toISOString() });

        try {
            const prices = await this.repo.getDailyCloses(
                request.allocations.map((allocation) => allocation.symbol),
                new Date(request.startDate),
                new Date(request.endDate),
            );
            const dataSource = { ...this.repo.source, fetchedAt: new Date().toISOString(), fingerprint: fingerprintPrices(prices) };
            const outcome = runBacktest(request, prices);

            await this.publisher.completed({ executionId, finishedAt: new Date().toISOString(), ...outcome, dataSource });
            logger.info("Backtest completed", { executionId, finalValue: outcome.finalValue });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error("Backtest failed", { executionId, error: message });
            await this.publisher.failed({ executionId, finishedAt: new Date().toISOString(), error: message });
        }
    }
}

export default BacktestService;
