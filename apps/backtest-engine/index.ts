import {
    KafkaClient,
    KafkaConsumer,
    KafkaProducer,
} from "@trading-plateform/kafka";
import { BACKTEST_TOPICS } from "@trading-plateform/contracts";
import { Logger } from "@trading-plateform/utils";
import BacktestConsumer from "./consumers/backtest.consumer";
import BacktestPublisher from "./publishers/backtest.publisher";
import BacktestService from "./services/backtest.service";

const logger = Logger.here();

const client = new KafkaClient();

const producer = new KafkaProducer(client.createProducer());

const consumer = new KafkaConsumer(
    client.createConsumer("backtest-engine-events"),
);

const backtestConsumer = new BacktestConsumer(
    new BacktestService(new BacktestPublisher(producer)),
);

async function main(): Promise<void> {
    await client.ensureTopics(Object.values(BACKTEST_TOPICS));

    await producer.connect();
    await consumer.connect();

    await consumer.subscribe(BACKTEST_TOPICS.requested);

    await consumer.consume(backtestConsumer.handle);

    logger.info("Backtest engine is listening to Kafka");
}

main().catch((error) => {
    logger.error("Failed to start backtest engine", error);
    process.exitCode = 1;
});
