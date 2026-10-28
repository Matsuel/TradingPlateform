import { createKafkaEvent, type KafkaProducer } from "@trading-plateform/kafka";
import {
    BACKTEST_TOPICS,
    type BacktestCompletedPayload,
    type BacktestFailedPayload,
    type BacktestStartedPayload,
} from "@trading-plateform/contracts";

export interface IBacktestPublisher {
    started(payload: BacktestStartedPayload): Promise<void>;
    completed(payload: BacktestCompletedPayload): Promise<void>;
    failed(payload: BacktestFailedPayload): Promise<void>;
}

class BacktestPublisher implements IBacktestPublisher {
    constructor(private readonly producer: KafkaProducer) { }

    started(payload: BacktestStartedPayload): Promise<void> {
        return this.publish(BACKTEST_TOPICS.started, payload);
    }

    completed(payload: BacktestCompletedPayload): Promise<void> {
        return this.publish(BACKTEST_TOPICS.completed, payload);
    }

    failed(payload: BacktestFailedPayload): Promise<void> {
        return this.publish(BACKTEST_TOPICS.failed, payload);
    }

    // Clé = executionId : tous les événements d'une exécution vont sur la même partition
    private publish<T extends { executionId: string }>(topic: string, payload: T): Promise<void> {
        return this.producer.publish(topic, {
            key: payload.executionId,
            value: createKafkaEvent(topic, payload),
        });
    }
}

export default BacktestPublisher;
