// Clé interne factice exigée par env.ts ; KAFKA_* par packages/kafka
process.env.INTERNAL_API_KEY ??= "test-internal-key-0000"
process.env.KAFKA_BROKERS ??= "localhost:9094"
process.env.KAFKA_CLIENT_ID ??= "backtest-engine-test"
process.env.KAFKAJS_NO_PARTITIONER_WARNING ??= "1"
