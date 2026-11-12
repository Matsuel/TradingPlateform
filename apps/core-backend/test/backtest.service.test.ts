import { beforeEach, expect, mock, test } from "bun:test"
import type { BacktestStatus } from "../generated/prisma/client"
import type { IBacktestRepository } from "../repositories/backtest.repository"

// Producteur Kafka factice : aucune connexion ; `published` liste les messages envoyés, `failPublish` simule un broker en panne
const published: { topic: string; key?: string }[] = []
let failPublish = false
mock.module("../lib/kafka", () => ({
    producer: {
        publish: async (topic: string, message: { key?: string }) => {
            if (failPublish) throw new Error("broker down")
            published.push({ topic, key: message.key })
        },
    },
    kafkaClient: {},
    consumer: {},
}))

const { default: BacktestService } = await import("../services/backtest.service")

type Update = { id: string; from: BacktestStatus[]; data: Record<string, unknown> }

// Repository en mémoire : enregistre chaque écriture ; seules les méthodes utilisées par ces tests sont renseignées
function fakeRepo(overrides: Partial<IBacktestRepository> = {}) {
    const updates: Update[] = []
    const stale: { from: BacktestStatus[]; before: Date; data: Record<string, unknown> }[] = []
    const repo = {
        updateExecution: async (id: string, from: BacktestStatus[], data: Record<string, unknown>) => {
            updates.push({ id, from, data })
            return true
        },
        failStaleExecutions: async (from: BacktestStatus[], before: Date, data: Record<string, unknown>) => {
            stale.push({ from, before, data })
            return 2
        },
        ...overrides,
    } as unknown as IBacktestRepository
    return { repo, updates, stale }
}

// Backtest minimal renvoyé par getById : propriétaire, allocation et dernière exécution
const backtestOf = (userId: string, latest?: { id: string; status: BacktestStatus; attempt: number }) =>
    ({
        id: "b1",
        userId,
        allocations: [{ symbol: "AAPL", weight: { toNumber: () => 1 } }],
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        investmentMode: "LUMP_SUM",
        initialAmount: { toNumber: () => 1000 },
        recurringAmount: null,
        investmentFrequency: null,
        rebalanceFrequency: "NONE",
        feeRate: { toNumber: () => 0.001 },
        benchmarkSymbol: null,
        executions: latest ? [latest] : [],
    }) as never

beforeEach(() => {
    published.length = 0
    failPublish = false
})

test("relancer pendant une exécution active lève EXECUTION_IN_PROGRESS avec l'id de l'exécution", async () => {
    const { repo } = fakeRepo({ getById: async () => backtestOf("u1", { id: "e1", status: "RUNNING", attempt: 1 }) })
    const service = new BacktestService()
    service.repo = repo

    const error = await service.rerun("b1", "u1").catch((e) => e)

    expect(error).toMatchObject({ code: "EXECUTION_IN_PROGRESS", statusCode: 409, data: { executionId: "e1" } })
    expect(published).toHaveLength(0)
})

test("relancer après un échec crée l'exécution suivante et publie backtest.requested", async () => {
    const created: number[] = []
    const { repo } = fakeRepo({
        getById: async () => backtestOf("u1", { id: "e1", status: "FAILED", attempt: 3 }),
        createExecution: async (_id: string, attempt: number) => {
            created.push(attempt)
            return { id: "e2" } as never
        },
    })
    const service = new BacktestService()
    service.repo = repo

    await service.rerun("b1", "u1")

    expect(created).toEqual([4])
    expect(published).toEqual([{ topic: "backtest.requested", key: "e2" }])
})

test("le backtest d'un autre utilisateur est refusé (403), un backtest inconnu est introuvable (404)", async () => {
    const service = new BacktestService()
    service.repo = fakeRepo({ getById: async () => backtestOf("autre") }).repo
    expect(await service.rerun("b1", "u1").catch((e) => e)).toMatchObject({ code: "ACCESS_DENIED", statusCode: 403 })

    service.repo = fakeRepo({ getById: async () => null }).repo
    expect(await service.rerun("b1", "u1").catch((e) => e)).toMatchObject({ code: "BACKTEST_NOT_FOUND", statusCode: 404 })
})

test("publication impossible : l'exécution PENDING passe FAILED et l'appel lève BACKTEST_QUEUE_FAILED", async () => {
    failPublish = true
    const { repo, updates } = fakeRepo({
        getById: async () => backtestOf("u1", { id: "e1", status: "COMPLETED", attempt: 1 }),
        createExecution: async () => ({ id: "e2" }) as never,
    })
    const service = new BacktestService()
    service.repo = repo

    const error = await service.rerun("b1", "u1").catch((e) => e)

    expect(error).toMatchObject({ code: "BACKTEST_QUEUE_FAILED", statusCode: 500 })
    expect(updates).toHaveLength(1)
    expect(updates[0]).toMatchObject({ id: "e2", from: ["PENDING"], data: { status: "FAILED" } })
})

test("backtest.started ne fait avancer qu'une exécution PENDING (rejeu sans effet)", async () => {
    const { repo, updates } = fakeRepo()
    const service = new BacktestService()
    service.repo = repo

    await service.markRunning({ executionId: "e1", startedAt: "2024-01-01T00:00:00.000Z" })

    expect(updates[0]).toMatchObject({ id: "e1", from: ["PENDING"], data: { status: "RUNNING" } })
})

test("backtest.failed ne touche que les exécutions actives et garde errorCode", async () => {
    const { repo, updates } = fakeRepo()
    const service = new BacktestService()
    service.repo = repo

    await service.fail({ executionId: "e1", finishedAt: "2024-01-01T00:00:00.000Z", error: "boom", errorCode: "NO_MARKET_DATA" })

    expect(updates[0]).toMatchObject({
        id: "e1",
        from: ["PENDING", "RUNNING"],
        data: { status: "FAILED", error: "boom", errorCode: "NO_MARKET_DATA" },
    })
})

test("une exécution active trop ancienne passe FAILED avec EXECUTION_TIMEOUT", async () => {
    const { repo, stale } = fakeRepo()
    const service = new BacktestService()
    service.repo = repo

    const before = Date.now()
    const count = await service.failStaleExecutions()

    expect(count).toBe(2)
    expect(stale[0]!.from).toEqual(["PENDING", "RUNNING"])
    // Seuil = maintenant − 15 min
    expect(before - stale[0]!.before.getTime()).toBeGreaterThanOrEqual(15 * 60_000 - 1000)
    expect(stale[0]!.data).toMatchObject({ status: "FAILED", errorCode: "EXECUTION_TIMEOUT" })
})
