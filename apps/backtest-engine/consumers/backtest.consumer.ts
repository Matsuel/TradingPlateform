import { Logger } from "@trading-plateform/utils";
import type { MessageHandler } from "@trading-plateform/kafka";
import { backtestRequestedEventSchema } from "@trading-plateform/contracts";
import type BacktestService from "../services/backtest.service";

const logger = Logger.here();

class BacktestConsumer {
    constructor(private readonly backtestService: BacktestService) { }

    handle: MessageHandler<unknown> = async (message, { topic }) => {
        const parsed = backtestRequestedEventSchema.safeParse(message);
        if (!parsed.success) {
            logger.warn("Invalid Kafka message", { topic, issues: parsed.error.issues });
            return;
        }
        await this.backtestService.run(parsed.data.payload);
    };
}

export default BacktestConsumer;
