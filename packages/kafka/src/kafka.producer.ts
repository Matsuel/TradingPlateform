import type { Producer } from "kafkajs";
import { KafkaMessage } from "./kafka.types";

export class KafkaProducer {
    constructor(private readonly producer: Producer) { }

    async connect(): Promise<void> {
        await this.producer.connect();
    }

    async publish<T>(
        topic: string,
        message: KafkaMessage<T>
    ): Promise<void> {
        await this.producer.send({
            topic,
            messages: [
                {
                    key: message.key,
                    value: JSON.stringify(message.value),
                    headers: message.headers,
                },
            ],
        });
    }

    async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }
}