import { prisma } from "../prisma"
import type { Backtest, Prisma } from "../generated/prisma/client"
import type { BacktestWithExecutions, CreateBacktestDTO } from "../interfaces/backtest.interface"

export interface IBacktestRepository {
    create(data: CreateBacktestDTO): Promise<BacktestWithExecutions>
    getById(id: string): Promise<Backtest | null>
    getAllByUserId(userId: string): Promise<{ data: BacktestWithExecutions[], count: number }>
}

const latestExecution = {
    executions: { orderBy: { createdAt: "desc" }, take: 1, include: { result: true } },
} satisfies Prisma.BacktestInclude

class BacktestRepository implements IBacktestRepository {
    async create(data: CreateBacktestDTO): Promise<BacktestWithExecutions> {
        return prisma.backtest.create({
            data: { ...data, executions: { create: {} } },
            include: latestExecution,
        })
    }

    async getById(id: string): Promise<Backtest | null> {
        return prisma.backtest.findUnique({
            where: { id },
        })
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
}

export default BacktestRepository
