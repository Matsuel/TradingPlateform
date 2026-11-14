import { afterAll, expect, spyOn, test } from "bun:test"
import type { MessageHandler } from "@azimut/kafka"

// Les transitions du service sont espionnées : on vérifie le routage, pas l'écriture en base
const calls: { method: string; payload: unknown }[] = []
const record = (method: string) => async (payload: unknown) => void calls.push({ method, payload })

const { default: BacktestService } = await import("../services/backtest.service")
const spies = [
    spyOn(BacktestService.prototype, "markRunning").mockImplementation(record("markRunning")),
    spyOn(BacktestService.prototype, "complete").mockImplementation(record("complete")),
    spyOn(BacktestService.prototype, "fail").mockImplementation(record("fail")),
]

// Les espions sont globaux au process : rendus aux autres fichiers de test
afterAll(() => spies.forEach((spy) => spy.mockRestore()))

const { default: BacktestConsumer } = await import("../consumers/backtest.consumer")

const envelope = (eventType: string, payload: object) => ({
    eventId: "ev1",
    eventType,
    occurredAt: "2024-01-01T00:00:00.000Z",
    version: 1,
    payload,
})
const context = (topic: string) => ({ topic }) as Parameters<MessageHandler<unknown>>[1]

test("backtest.started est routé vers markRunning", async () => {
    calls.length = 0
    const payload = { executionId: "e1", startedAt: "2024-01-01T00:00:00.000Z" }

    await new BacktestConsumer().handle(envelope("backtest.started", payload), context("backtest.started"))

    expect(calls).toEqual([{ method: "markRunning", payload }])
})

test("backtest.failed est routé vers fail avec son errorCode", async () => {
    calls.length = 0
    const payload = { executionId: "e1", finishedAt: "2024-01-01T00:00:00.000Z", error: "boom", errorCode: "ENGINE_FAILED" }

    await new BacktestConsumer().handle(envelope("backtest.failed", payload), context("backtest.failed"))

    expect(calls).toEqual([{ method: "fail", payload }])
})

test("un message invalide est ignoré sans exception (la partition n'est pas bloquée)", async () => {
    calls.length = 0

    await new BacktestConsumer().handle({ nonsense: true }, context("backtest.completed"))

    expect(calls).toEqual([])
})
