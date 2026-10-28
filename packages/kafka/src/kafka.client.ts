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

    async ensureTopics(topics: string[]): Promise<void> {
        const admin = this.kafka.admin();
        await admin.connect();
        try {
            const existing = await admin.listTopics();
            const missing = topics.filter((topic) => !existing.includes(topic));
            if (missing.length === 0) return;
            await admin.createTopics({
                topics: missing.map((topic) => ({ topic })),
                waitForLeaders: true,
            });
        } finally {
            await admin.disconnect();
        }
    }
}