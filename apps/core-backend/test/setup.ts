// Variables exigées par env.ts et la config Kafka : valeurs factices, aucune connexion n'est ouverte par les tests
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test"
process.env.BETTER_AUTH_URL ??= "http://localhost:8000"
process.env.BETTER_AUTH_SECRET ??= "test-secret-test-secret-test-secret-0000"
process.env.INTERNAL_API_KEY ??= "test-internal-key-0000"
process.env.KAFKA_BROKERS ??= "localhost:9094"
process.env.KAFKA_CLIENT_ID ??= "core-backend-test"
process.env.KAFKAJS_NO_PARTITIONER_WARNING ??= "1"
