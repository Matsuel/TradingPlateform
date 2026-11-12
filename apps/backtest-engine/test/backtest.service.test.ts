import { expect, test } from "bun:test"
import type { BacktestRequestedPayload } from "@trading-plateform/contracts"
import type { IBacktestPublisher } from "../publishers/backtest.publisher"
import type { IMarketRepository } from "../repositories/market.repository"
import BacktestService from "../services/backtest.service"
import { syntheticSeries } from "./backtest.fixture"

const request: BacktestRequestedPayload = {
    executionId: "e1",
    backtestId: "b1",
    userId: "u1",
    allocations: [{ symbol: "AAA", weight: 1 }],
    startDate: "2024-01-02T00:00:00.000Z",
    endDate: "2024-01-10T00:00:00.000Z",
    investmentMode: "LUMP_SUM",
    initialAmount: 1000,
    recurringAmount: null,
    investmentFrequency: null,
    rebalanceFrequency: "NONE",
    feeRate: 0,
    benchmarkSymbol: null,
}

// Publisher qui note l'ordre des événements publiés
function recordingPublisher() {
    const events: { type: string; payload: object }[] = []
    const publisher = {
        started: async (payload) => void events.push({ type: "started", payload }),
        completed: async (payload) => void events.push({ type: "completed", payload }),
        failed: async (payload) => void events.push({ type: "failed", payload }),
    } as IBacktestPublisher
    return { publisher, events }
}

const marketWith = (getDailyCloses: IMarketRepository["getDailyCloses"]) =>
    ({ source: { provider: "test", priceType: "close" }, getDailyCloses }) as unknown as IMarketRepository

test("un backtest réussi publie started puis completed avec la provenance des cours", async () => {
    const { publisher, events } = recordingPublisher()
    const service = new BacktestService(publisher)
    service.repo = marketWith(async () => ({ AAA: syntheticSeries(1, "2024-01-02", 8, 10000) }))

    await service.run(request)

    expect(events.map((event) => event.type)).toEqual(["started", "completed"])
    expect((events[1]!.payload as { dataSource: unknown }).dataSource).toMatchObject({ provider: "test" })
})

test("un symbole sans cours publie failed avec NO_MARKET_DATA", async () => {
    const { publisher, events } = recordingPublisher()
    const service = new BacktestService(publisher)
    service.repo = marketWith(async () => ({ AAA: [] }))

    await service.run(request)

    expect(events.map((event) => event.type)).toEqual(["started", "failed"])
    expect(events[1]!.payload).toMatchObject({ executionId: "e1", errorCode: "NO_MARKET_DATA" })
})

test("une panne du fournisseur de cours publie failed avec ENGINE_FAILED, sans lever", async () => {
    const { publisher, events } = recordingPublisher()
    const service = new BacktestService(publisher)
    service.repo = marketWith(async () => {
        throw new Error("yahoo down")
    })

    await service.run(request)

    expect(events[1]).toMatchObject({ type: "failed", payload: { errorCode: "ENGINE_FAILED", error: "yahoo down" } })
})
