import { beforeEach, expect, test } from "bun:test"
import BacktestRepository from "../repositories/backtest.repository"
import { prisma } from "../prisma"
import { createUser, describeWithDb, resetDatabase } from "./database"

const repo = new BacktestRepository()

// Paramètres minimaux d'un backtest ; `allocations` créées avec lui
const backtestFor = (userId: string, name = "Test") => ({
    userId,
    name,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    investmentMode: "LUMP_SUM" as const,
    initialAmount: 1000,
    rebalanceFrequency: "NONE" as const,
    feeRate: 0.001,
    allocations: { create: [{ symbol: "AAPL", weight: 1 }] },
})

describeWithDb("BacktestRepository (base de test)", () => {
    let userId: string
    beforeEach(async () => {
        await resetDatabase()
        userId = await createUser()
    })

    test("create écrit le backtest, sa première exécution PENDING et le pointeur latestExecution", async () => {
        const backtest = await repo.create(backtestFor(userId))

        expect(backtest.executions).toHaveLength(1)
        expect(backtest.executions[0]).toMatchObject({ status: "PENDING", attempt: 1 })
        expect(backtest.latestExecutionId).toBe(backtest.executions[0]!.id)
        expect(backtest.allocations).toHaveLength(1)
    })

    test("createExecution déplace latestExecution sur la nouvelle tentative", async () => {
        const backtest = await repo.create(backtestFor(userId))

        const second = await repo.createExecution(backtest.id, 2)

        expect((await repo.getById(backtest.id))?.latestExecutionId).toBe(second.id)
        expect(second.attempt).toBe(2)
    })

    test("updateExecution n'applique la transition que depuis les statuts autorisés (rejeu sans effet)", async () => {
        const backtest = await repo.create(backtestFor(userId))
        const executionId = backtest.executions[0]!.id

        expect(await repo.updateExecution(executionId, ["PENDING"], { status: "RUNNING" })).toBe(true)
        // Même événement rejoué : l'exécution n'est plus PENDING
        expect(await repo.updateExecution(executionId, ["PENDING"], { status: "RUNNING" })).toBe(false)
        expect(await repo.updateExecution(executionId, ["RUNNING"], { status: "FAILED", errorCode: "ENGINE_FAILED" })).toBe(true)

        const execution = await prisma.backtestExecution.findUniqueOrThrow({ where: { id: executionId } })
        expect(execution).toMatchObject({ status: "FAILED", errorCode: "ENGINE_FAILED" })
    })

    test("failStaleExecutions n'échoue que les exécutions actives créées avant le seuil", async () => {
        const stale = await repo.create(backtestFor(userId, "ancien"))
        const fresh = await repo.create(backtestFor(userId, "récent"))
        const done = await repo.create(backtestFor(userId, "terminé"))
        const old = new Date(Date.now() - 60 * 60_000)
        await prisma.backtestExecution.update({ where: { id: stale.executions[0]!.id }, data: { createdAt: old, status: "RUNNING" } })
        await prisma.backtestExecution.update({ where: { id: done.executions[0]!.id }, data: { createdAt: old, status: "COMPLETED" } })

        const count = await repo.failStaleExecutions(["PENDING", "RUNNING"], new Date(Date.now() - 15 * 60_000), {
            status: "FAILED",
            errorCode: "EXECUTION_TIMEOUT",
        })

        expect(count).toBe(1)
        const statuses = await prisma.backtestExecution.findMany({ select: { id: true, status: true } })
        const statusOf = (id: string) => statuses.find((row) => row.id === id)?.status
        expect(statusOf(stale.executions[0]!.id)).toBe("FAILED")
        expect(statusOf(fresh.executions[0]!.id)).toBe("PENDING")
        expect(statusOf(done.executions[0]!.id)).toBe("COMPLETED")
    })

    test("getAllByUserId ne renvoie que les backtests de l'utilisateur, paginés, et filtre sur le statut de la dernière exécution", async () => {
        const other = await createUser("autre@test.dev")
        await repo.create(backtestFor(userId, "a"))
        const running = await repo.create(backtestFor(userId, "b"))
        await repo.create(backtestFor(other, "autre"))
        await repo.updateExecution(running.executions[0]!.id, ["PENDING"], { status: "RUNNING" })

        const all = await repo.getAllByUserId(userId, { page: 1, pageSize: 1 }, {})
        expect(all.count).toBe(2)
        expect(all.data).toHaveLength(1)

        const onlyRunning = await repo.getAllByUserId(userId, { page: 1, pageSize: 10 }, { status: ["RUNNING"] })
        expect(onlyRunning.data.map((backtest) => backtest.name)).toEqual(["b"])
    })

    test("completeExecution écrit les dividendes et la décomposition du rendement, et rejoue sans effet", async () => {
        const backtest = await repo.create(backtestFor(userId))
        const executionId = backtest.executions[0]!.id
        await repo.updateExecution(executionId, ["PENDING"], { status: "RUNNING" })
        const dividendEvents = [{ date: "2024-02-09", symbol: "AAPL", amount: 1.5, quantity: 0.008 }]
        const returnBreakdown = { price: 0.1, dividends: 0.02, local: 0.12, fx: -0.01 }
        const result = {
            finishedAt: new Date(),
            finalValue: 1110,
            totalInvested: 1000,
            totalFees: 1,
            profit: 110,
            totalReturn: 0.11,
            priceReturn: 0.09,
            dividendTotal: 1.5,
            dividendGain: 20,
            dividendEvents,
            returnBreakdown,
            totalTrades: 1,
            rebalanceCount: 0,
            maxDrawdown: -0.05,
            maxDrawdownDate: null,
            maxDrawdownPeakDate: null,
            maxDrawdownRecoveryDate: null,
            recoveryDays: null,
            cagr: null,
            volatility: null,
            sharpeRatio: null,
            riskFreeRate: 0,
            rollingSummary: [{ years: 1, count: 2, worst: -0.1, median: 0, best: 0.2, worstDate: "2020-01-02", negativeShare: 0.5, points: [{ date: "2020-01-02", value: -0.1 }] }],
            equityCurve: [],
            trades: [],
            holdings: [],
            lumpSumComparison: null,
            benchmark: null,
            executionRule: "CLOSE_ON_SCHEDULED_DAY" as const,
            dataSource: { provider: "yahoo-finance2" as const, priceType: "TOTAL_RETURN" as const, fetchedAt: new Date().toISOString(), fingerprint: "a".repeat(64) },
        }

        expect(await repo.completeExecution(executionId, ["RUNNING"], result)).toBe(true)
        expect(await repo.completeExecution(executionId, ["RUNNING"], result)).toBe(false)

        const stored = await prisma.backtestResult.findUniqueOrThrow({ where: { executionId } })
        expect(Number(stored.dividendTotal)).toBe(1.5)
        expect(Number(stored.dividendGain)).toBe(20)
        expect(Number(stored.priceReturn)).toBe(0.09)
        expect(stored.dividendEvents).toEqual(dividendEvents)
        expect(stored.returnBreakdown).toEqual(returnBreakdown)
        expect(stored.rollingSummary).toEqual(result.rollingSummary)
    })

    test("countByLatestStatus compte par statut de la dernière exécution", async () => {
        const backtest = await repo.create(backtestFor(userId))
        await repo.create(backtestFor(userId, "autre"))
        await repo.updateExecution(backtest.executions[0]!.id, ["PENDING"], { status: "FAILED" })

        const counts = await repo.countByLatestStatus(userId)

        expect(counts.total).toBe(2)
        expect(Object.fromEntries(counts.byStatus.map(({ status, count }) => [status, count]))).toEqual({ PENDING: 1, FAILED: 1 })
    })
})
