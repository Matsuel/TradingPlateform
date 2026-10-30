import { CompressionTypes, type Producer } from "kafkajs";
import type { KafkaMessage } from "./kafka.types";

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
            // La limite du broker (~1 Mo par défaut) s'applique au message compressé : un long backtest (courbes journalières) la dépasse en JSON brut
            compression: CompressionTypes.GZIP,
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