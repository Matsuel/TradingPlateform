import type { z } from "zod"
import { Logger } from "@trading-plateform/utils"
import type { MessageHandler } from "@trading-plateform/kafka"
import {
    BACKTEST_TOPICS,
    backtestCompletedEventSchema,
    backtestFailedEventSchema,
    backtestStartedEventSchema,
} from "@trading-plateform/contracts"
import BacktestService from "../services/backtest.service"

const logger = Logger.here()

class BacktestConsumer {

    private backtestService = new BacktestService()

    handle: MessageHandler<unknown> = async (message, { topic }) => {
        switch (topic) {
            case BACKTEST_TOPICS.started: {
                const event = this.parse(backtestStartedEventSchema, message, topic)
                if (event) await this.backtestService.markRunning(event.payload)
                break
            }
            case BACKTEST_TOPICS.completed: {
                const event = this.parse(backtestCompletedEventSchema, message, topic)
                if (event) await this.backtestService.complete(event.payload)
                break
            }
            case BACKTEST_TOPICS.failed: {
                const event = this.parse(backtestFailedEventSchema, message, topic)
                if (event) await this.backtestService.fail(event.payload)
                break
            }
        }
    }

    // Un message invalide est loggué et ignoré pour ne pas bloquer la partition
    private parse<T extends z.ZodType>(schema: T, message: unknown, topic: string): z.infer<T> | null {
        const parsed = schema.safeParse(message)
        if (!parsed.success) {
            logger.warn("Invalid Kafka message", { topic, issues: parsed.error.issues })
            return null
        }
        return parsed.data
    }
}

export default BacktestConsumer
