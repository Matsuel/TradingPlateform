import { prisma } from "../prisma"
import type { Prisma } from "../generated/prisma/client"

export interface IBacktestRepository {
    create(data: Prisma.BacktestUncheckedCreateInput): Promise<any>
    getById(userId: string, id: string): Promise<any>
    getAllByUserId(userId: string): Promise<any>
}

class BacktestRepository implements IBacktestRepository {
    async create(data: Prisma.BacktestUncheckedCreateInput): Promise<any> {
        return prisma.backtest.create({
            data: { ...data, executions: { create: {} } },
            include: { executions: true },
        })
    }

    async getById(userId: string, id: string): Promise<any> {
        return prisma.backtest.findUnique({
            where: { id, userId },
        })
    }

    async getAllByUserId(userId: string): Promise<any | null> {
        const [data, count] = await prisma.$transaction([
            prisma.backtest.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                include: { executions: { orderBy: { createdAt: "desc" }, take: 1, include: { result: true } } },
            }),
            prisma.backtest.count({ where: { userId } }),
        ])
        return { data, count }
    }
}

export default BacktestRepository