import { z } from "zod";

const schema = z.object({
    KAFKA_BROKERS: z.string().min(1),
    KAFKA_CLIENT_ID: z.string().min(1),
});

const env = schema.parse(process.env);

export const kafkaConfig = {
    brokers: env.KAFKA_BROKERS.split(",").map((broker) =>
        broker.trim()
    ),
    clientId: env.KAFKA_CLIENT_ID,
};