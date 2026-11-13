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

test("createBatch crée un backtest par date, trié, du même nom, lié par le même batchId, et publie un événement chacun", async () => {
    const created: { batchId?: string; name: string; startDate: Date }[] = []
    const { repo } = fakeRepo({
        create: async (data: never) => {
            created.push(data)
            return { ...(backtestOf("u1") as object), executions: [{ id: `e${created.length}` }] } as never
        },
    })
    const service = new BacktestService()
    service.repo = repo

    const { batchId, backtests } = await service.createBatch("u1", {
        name: "DCA",
        investmentMode: "LUMP_SUM",
        allocations: [{ symbol: "AAPL", weight: 1 }],
        startDates: [new Date("2024-06-01"), new Date("2024-01-01")],
        end: new Date("2024-12-31"),
        initialAmount: 1000,
        rebalanceFrequency: "NONE",
        fee: 0.1,
    })

    expect(created.map((c) => c.startDate.toISOString().slice(0, 10))).toEqual(["2024-01-01", "2024-06-01"])
    expect(new Set(created.map((c) => c.batchId))).toEqual(new Set([batchId]))
    expect(backtests).toHaveLength(2)
    expect(published).toHaveLength(2)
})

// Valeur Decimal factice : seul `toNumber` est lu par le service
const dec = (value: number) => ({ toNumber: () => value, value })

// Départ d'un lot : métriques du dernier résultat terminé (null = pas terminé)
const batchRow = (id: string, start: string, status: BacktestStatus, cagr: number | null) =>
    ({
        id,
        userId: "u1",
        name: "DCA",
        startDate: new Date(start),
        endDate: new Date("2026-06-30"),
        latestExecution: { status },
        executions: cagr === null ? [] : [{ result: { finalValue: dec(100), cagr: dec(cagr), volatility: dec(0.1), sharpeRatio: dec(1), maxDrawdown: dec(-0.2), totalReturn: dec(0.5) } }],
    })

const rolling = [
    { years: 1, count: 10, worst: -0.2, median: 0.05, best: 0.3, worstDate: "2022-01-03", negativeShare: 0.2, points: [] },
    { years: 3, count: 8, worst: -0.041, median: 0.1, best: 0.2, worstDate: "2022-01-03", negativeShare: 0.08, points: [] },
]

test("getBatch d'un autre utilisateur lève ForbiddenError, d'un lot vide NotFoundError", async () => {
    const service = new BacktestService()
    service.repo = fakeRepo({ getBatch: async () => ({ backtests: [{ userId: "u2" }] as never, rollingSummary: null }) }).repo
    expect(await service.getBatch("l1", "u1").catch((e) => e)).toMatchObject({ statusCode: 403 })

    service.repo = fakeRepo({ getBatch: async () => ({ backtests: [], rollingSummary: null }) }).repo
    expect(await service.getBatch("l1", "u1").catch((e) => e)).toMatchObject({ statusCode: 404 })
})

test("getBatch d'un lot terminé : synthèse, meilleur et pire départ, fenêtre de 3 ans", async () => {
    const service = new BacktestService()
    service.repo = fakeRepo({
        getBatch: async () => ({
            backtests: [
                batchRow("b1", "2016-01-01", "COMPLETED", 0.112),
                batchRow("b2", "2019-01-01", "COMPLETED", 0.123),
                batchRow("b3", "2022-01-01", "COMPLETED", 0.061),
            ] as never,
            rollingSummary: rolling as never,
        }),
    }).repo

    const batch = await service.getBatch("l1", "u1")

    expect(batch).toMatchObject({ name: "DCA", status: "COMPLETED" })
    expect(batch.rows.map((row) => row.rank)).toEqual([null, "BEST", "WORST"])
    expect(batch.summary).toEqual({
        medianCagr: 0.112,
        cagrSpread: expect.closeTo(0.062, 6),
        worstStart: { startDate: "2022-01-01T00:00:00.000Z", cagr: 0.061 },
        window: { years: 3, worst: -0.041, worstDate: "2022-01-03", negativeShare: 0.08, count: 8 },
    })
    expect(batch.rollingSummary).toEqual(rolling as never)
})

test("getBatch d'un lot en cours : pas de rang, départ non terminé sans résultat, fenêtres masquées si le plus ancien n'est pas terminé", async () => {
    const service = new BacktestService()
    service.repo = fakeRepo({
        getBatch: async () => ({
            backtests: [batchRow("b1", "2016-01-01", "RUNNING", null), batchRow("b2", "2019-01-01", "COMPLETED", 0.1)] as never,
            rollingSummary: rolling as never,
        }),
    }).repo

    const batch = await service.getBatch("l1", "u1")

    expect(batch.status).toBe("RUNNING")
    expect(batch.rows.map((row) => [row.status, row.result === null, row.rank])).toEqual([["RUNNING", true, null], ["COMPLETED", false, null]])
    expect(batch.rollingSummary).toBeNull()
    expect(batch.summary?.window).toBeNull()
})

test("rerunBatch relance chaque départ, et refuse tout le lot si l'un est actif", async () => {
    const created: string[] = []
    const rows = [batchRow("b1", "2016-01-01", "COMPLETED", 0.1), batchRow("b2", "2019-01-01", "COMPLETED", 0.1)]
    const service = new BacktestService()
    service.repo = fakeRepo({
        getBatch: async () => ({ backtests: rows as never, rollingSummary: null }),
        getById: async () => backtestOf("u1", { id: "e1", status: "COMPLETED", attempt: 1 }),
        createExecution: async (id: string, attempt: number) => {
            created.push(`${id}:${attempt}`)
            return { id: "e2" } as never
        },
    }).repo

    await service.rerunBatch("l1", "u1")
    expect(published).toHaveLength(2)

    rows[1]!.latestExecution.status = "RUNNING"
    expect(await service.rerunBatch("l1", "u1").catch((e) => e)).toMatchObject({ statusCode: 409 })
    expect(published).toHaveLength(2)
})

test("restartBatch recrée la stratégie du lot à de nouvelles dates dans un nouveau lot, et refuse un départ à moins d'un an de la fin", async () => {
    const created: { batchId?: string; startDate: Date; feeRate: number }[] = []
    const dec = (value: number) => ({ toNumber: () => value, times: (n: number) => ({ toNumber: () => value * n }) })
    const source = {
        ...(backtestOf("u1") as object),
        name: "DCA",
        endDate: new Date("2026-06-30"),
        allocations: [{ symbol: "AAPL", weight: dec(1) }],
        initialAmount: dec(1000),
        feeRate: dec(0.001),
    }
    const service = new BacktestService()
    service.repo = fakeRepo({
        getBatch: async () => ({ backtests: [{ id: "b1", userId: "u1" }] as never, rollingSummary: null }),
        getById: async () => source as never,
        create: async (data: never) => {
            created.push(data)
            return { ...source, executions: [{ id: `e${created.length}` }] } as never
        },
    }).repo

    const { batchId } = await service.restartBatch("l1", "u1", { startDates: [new Date("2018-01-01"), new Date("2020-01-01")] })

    expect(created.map((c) => c.startDate.getUTCFullYear())).toEqual([2018, 2020])
    expect(created.every((c) => c.batchId === batchId)).toBe(true)
    expect(published).toHaveLength(2)

    const error = await service.restartBatch("l1", "u1", { startDates: [new Date("2018-01-01"), new Date("2025-12-31")] }).catch((e) => e)
    expect(error).toMatchObject({ code: "START_TOO_CLOSE_TO_END", statusCode: 400 })
})
