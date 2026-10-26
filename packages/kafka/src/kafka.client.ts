import { Kafka, logLevel } from "kafkajs";
import { kafkaConfig } from "./config/kafka.config";

export class KafkaClient {
    private readonly kafka: Kafka;

    constructor() {
        this.kafka = new Kafka({
            clientId: kafkaConfig.clientId,
            brokers: kafkaConfig.brokers,
            logLevel: logLevel.INFO,
            retry: {
                initialRetryTime: 300,
                retries: 8,
            },
        });
    }

    createProducer() {
        return this.kafka.producer();
    }

    createConsumer(groupId: string) {
        return this.kafka.consumer({ groupId });
    }
}