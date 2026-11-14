import { KafkaClient, KafkaConsumer, KafkaProducer } from "@azimut/kafka";

export const kafkaClient = new KafkaClient();

export const producer = new KafkaProducer(kafkaClient.createProducer());

export const consumer = new KafkaConsumer(kafkaClient.createConsumer("core-backend-events"));
