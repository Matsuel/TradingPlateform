import { Logger } from "@azimut/utils";
import type { BacktestRequestedPayload } from "@azimut/contracts";
import BacktestError from "../errors/backtest.error";
import runBacktest from "../engine/backtest.engine";
import { foreignCurrencies, fxPairSymbol } from "../engine/backtest.fx";
import { fingerprintMarket } from "../engine/backtest.utils";
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
            const symbols = request.allocations.map((allocation) => allocation.symbol);
            // Cours du benchmark chargés avec ceux de l'allocation : inclus dans l'empreinte dataSource.fingerprint
            if (request.benchmarkSymbol && !symbols.includes(request.benchmarkSymbol)) symbols.push(request.benchmarkSymbol);
            const start = new Date(request.startDate);
            const end = new Date(request.endDate);

            const dividendData = await this.repo.getDividends(symbols, start, end);
            const currencies = Object.fromEntries(Object.entries(dividendData).map(([symbol, { currency }]) => [symbol, currency]));
            const dividends = Object.fromEntries(Object.entries(dividendData).map(([symbol, { dividends }]) => [symbol, dividends]));
            // Les taux EUR/devise se lisent comme des cours : une paire par devise étrangère, une fois les devises connues
            const pairs = foreignCurrencies(symbols, currencies).map(fxPairSymbol);
            const closes = await this.repo.getDailyCloses([...symbols, ...pairs], start, end);
            const prices = Object.fromEntries(symbols.map((symbol) => [symbol, closes[symbol] ?? []]));
            const fxRates = Object.fromEntries(pairs.map((pair) => [pair, closes[pair] ?? []]));

            const dataSource = {
                ...this.repo.source,
                fetchedAt: new Date().toISOString(),
                fingerprint: fingerprintMarket({ prices, dividends, fxRates }),
            };
            const outcome = runBacktest(request, prices, { dividends, currencies, fxRates });

            await this.publisher.completed({ executionId, finishedAt: new Date().toISOString(), ...outcome, dataSource });
            logger.info("Backtest completed", { executionId, finalValue: outcome.finalValue });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error("Backtest failed", { executionId, error: message });
            // Hors erreur métier de l'engine (market-service injoignable, bug) : cause générique
            const errorCode = error instanceof BacktestError ? error.code : "ENGINE_FAILED";
            await this.publisher.failed({ executionId, finishedAt: new Date().toISOString(), error: message, errorCode });
        }
    }
}

export default BacktestService;
