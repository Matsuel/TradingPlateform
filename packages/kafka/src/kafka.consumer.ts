import type { Consumer, EachMessagePayload } from "kafkajs";
import { Logger } from "@azimut/utils";

const logger = Logger.here();

export type MessageHandler<T> = (
    message: T,
    context: EachMessagePayload
) => Promise<void>;

export class KafkaConsumer {
    constructor(private readonly consumer: Consumer) { }

    async subscribe(
        topic: string,
        fromBeginning = false
    ): Promise<void> {
        await this.consumer.subscribe({
            topic,
            fromBeginning,
        });
    }

    async consume<T>(
        handler: MessageHandler<T>
    ): Promise<void> {
        await this.consumer.run({
            eachMessage: async (context) => {
                const raw = context.message.value?.toString();

                // Message illisible : rejouer ne le réparera pas, on l'écarte sans bloquer la partition
                let message: T;
                try {
                    message = JSON.parse(raw ?? "") as T;
                } catch {
                    logger.warn("Unreadable Kafka message skipped", { topic: context.topic, offset: context.message.offset });
                    return;
                }

                // Rejouer est la politique at-least-once : l'exception repart à kafkajs (reprise avec délai), après un log qui situe le message
                try {
                    await handler(message, context);
                } catch (error) {
                    logger.error("Kafka handler failed", {
                        topic: context.topic,
                        partition: context.partition,
                        offset: context.message.offset,
                        error: error instanceof Error ? error.message : String(error),
                    });
                    throw error;
                }
            },
        });
    }

    async connect(): Promise<void> {
        await this.consumer.connect();
    }

    async disconnect(): Promise<void> {
        await this.consumer.disconnect();
    }
}