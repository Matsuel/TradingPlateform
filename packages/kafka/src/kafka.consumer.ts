import type { Consumer, EachMessagePayload } from "kafkajs";

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

                if (!raw) {
                    throw new Error("Kafka message is empty");
                }

                const message = JSON.parse(raw) as T;

                await handler(message, context);
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