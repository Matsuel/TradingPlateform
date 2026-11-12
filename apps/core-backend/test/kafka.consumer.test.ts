import { expect, test } from "bun:test"
import { KafkaConsumer, type MessageHandler } from "@trading-plateform/kafka"

// Types de kafkajs dérivés du package Kafka : core-backend ne dépend pas de kafkajs
type Consumer = ConstructorParameters<typeof KafkaConsumer>[0]
type EachMessagePayload = Parameters<MessageHandler<unknown>>[1]

// Consumer kafkajs factice : `run` mémorise le gestionnaire `eachMessage`, que le test appelle avec un message
function fakeConsumer() {
    let eachMessage: ((payload: EachMessagePayload) => Promise<void>) | undefined
    const consumer = {
        run: async (config: { eachMessage: (payload: EachMessagePayload) => Promise<void> }) => {
            eachMessage = config.eachMessage
        },
    } as unknown as Consumer
    const deliver = (value: string | null) =>
        eachMessage!({ topic: "backtest.started", partition: 0, message: { offset: "7", value: value === null ? null : Buffer.from(value) } } as unknown as EachMessagePayload)
    return { consumer, deliver }
}

test("un message JSON valide est transmis au handler", async () => {
    const { consumer, deliver } = fakeConsumer()
    const received: unknown[] = []
    await new KafkaConsumer(consumer).consume(async (message) => void received.push(message))

    await deliver(JSON.stringify({ a: 1 }))

    expect(received).toEqual([{ a: 1 }])
})

test("un message illisible ou vide est écarté sans exception ni appel du handler", async () => {
    const { consumer, deliver } = fakeConsumer()
    let calls = 0
    await new KafkaConsumer(consumer).consume(async () => void calls++)

    await deliver("{pas du json")
    await deliver(null)

    expect(calls).toBe(0)
})

test("une exception du handler repart à kafkajs, qui rejoue le message (at-least-once)", async () => {
    const { consumer, deliver } = fakeConsumer()
    await new KafkaConsumer(consumer).consume(async () => {
        throw new Error("base indisponible")
    })

    await expect(deliver(JSON.stringify({ a: 1 }))).rejects.toThrow("base indisponible")
})
