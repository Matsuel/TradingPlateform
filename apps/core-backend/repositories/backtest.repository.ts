import { prisma } from "../prisma"
import type { BacktestExecution, BacktestStatus, Prisma } from "../generated/prisma/client"
import type { BacktestDetails, BacktestWithExecutions, CompleteExecutionDTO, CreateBacktestDTO } from "../interfaces/backtest.interface"

export interface IBacktestRepository {
    create(data: CreateBacktestDTO): Promise<BacktestWithExecutions>
    getById(id: string): Promise<BacktestWithExecutions | null>
    getDetailsById(id: string): Promise<BacktestDetails | null>
    getAllByUserId(userId: string): Promise<{ data: BacktestWithExecutions[], count: number }>
    createExecution(backtestId: string, attempt: number): Promise<BacktestExecution>
    updateExecution(id: string, from: BacktestStatus[], data: Prisma.BacktestExecutionUpdateManyMutationInput): Promise<boolean>
    completeExecution(id: string, from: BacktestStatus[], data: CompleteExecutionDTO): Promise<boolean>
}

const executionSummary = {
    orderBy: { createdAt: "desc" },
    include: { result: { omit: { equityCurve: true, trades: true } } },
} satisfies Prisma.Backtest$executionsArgs

const latestExecution = {
    executions: { ...executionSummary, take: 1 },
} satisfies Prisma.BacktestInclude

class BacktestRepository implements IBacktestRepository {
    async create(data: CreateBacktestDTO): Promise<BacktestWithExecutions> {
        return prisma.backtest.create({
            data: { ...data, executions: { create: {} } },
            include: latestExecution,
        })
    }

    async getById(id: string): Promise<BacktestWithExecutions | null> {
        return prisma.backtest.findUnique({
            where: { id },
            include: latestExecution,
        })
    }

    async getDetailsById(id: string): Promise<BacktestDetails | null> {
        const [backtest, result] = await prisma.$transaction([
            prisma.backtest.findUnique({
                where: { id },
                include: { executions: executionSummary },
            }),
            prisma.backtestResult.findFirst({
                where: { execution: { backtestId: id, status: "COMPLETED" } },
                orderBy: { execution: { createdAt: "desc" } },
            }),
        ])
        return backtest && { ...backtest, result }
    }

    async getAllByUserId(userId: string): Promise<{ data: BacktestWithExecutions[], count: number }> {
        const [data, count] = await prisma.$transaction([
            prisma.backtest.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                include: latestExecution,
            }),
            prisma.backtest.count({ where: { userId } }),
        ])
        return { data, count }
    }

    async createExecution(backtestId: string, attempt: number): Promise<BacktestExecution> {
        return prisma.backtestExecution.create({
            data: { backtestId, attempt },
        })
    }

    async updateExecution(id: string, from: BacktestStatus[], data: Prisma.BacktestExecutionUpdateManyMutationInput): Promise<boolean> {
        const { count } = await prisma.backtestExecution.updateMany({
            where: { id, status: { in: from } },
            data,
        })
        return count > 0
    }

    async completeExecution(id: string, from: BacktestStatus[], { finishedAt, ...result }: CompleteExecutionDTO): Promise<boolean> {
        return prisma.$transaction(async (tx) => {
            const { count } = await tx.backtestExecution.updateMany({
                where: { id, status: { in: from } },
                data: { status: "COMPLETED", finishedAt },
            })
            if (count === 0) return false
            await tx.backtestResult.create({ data: { executionId: id, ...result } })
            return true
        })
    }
}

export default BacktestRepository
