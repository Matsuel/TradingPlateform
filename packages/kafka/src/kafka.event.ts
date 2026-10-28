import type { KafkaEvent } from "./kafka.types";

export function createKafkaEvent<T>(eventType: string, payload: T): KafkaEvent<T> {
    return {
        eventId: crypto.randomUUID(),
        eventType,
        occurredAt: new Date().toISOString(),
        version: 1,
        payload,
    };
}
