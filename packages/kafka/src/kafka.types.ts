export interface KafkaMessage<T> {
    key?: string;
    value: T;
    headers?: Record<string, string>;
}

export interface KafkaEvent<T> {
    eventId: string;
    eventType: string;
    occurredAt: string;
    version: 1;
    payload: T;
}

export interface BacktestCompletedEvent {
    eventId: string;
    eventType: "backtest.completed";
    occurredAt: string;
    version: 1;
    payload: {
        backtestId: string;
        status: "COMPLETED";
        resultId: string;
    };
}