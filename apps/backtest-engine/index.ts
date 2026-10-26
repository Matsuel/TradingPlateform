
import {
    KafkaClient,
    KafkaConsumer,
    KafkaProducer,
} from "@trading-plateform/kafka";

import type { EachMessagePayload } from "kafkajs";

const client = new KafkaClient();

const producer = new KafkaProducer(client.createProducer());

const consumer = new KafkaConsumer(
    client.createConsumer("backtest-engine-events"),
);

interface BacktestRequestedEvent {
    backtestId: string;
    userId: string;
}

async function main(): Promise<void> {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe("backtest.requested");

    await consumer.consume<BacktestRequestedEvent>(
        async (event, context: EachMessagePayload) => {
            console.log("Backtest requested:", event);

            // TODO : lancer le calcul du backtest.
            // TODO : publier backtest.started puis completed/failed.
        },
    );

    console.log("Backtest engine is listening to Kafka.");
}

main().catch((error) => {
    console.error("Failed to start backtest engine:", error);
    process.exitCode = 1;
});
