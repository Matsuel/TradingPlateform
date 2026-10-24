import { prisma } from "../prisma"

export interface IBacktestRepository {
    create(userId: string, data: any): Promise<any>
    getById(userId: string, id: string): Promise<any>
    getAllByUserId(userId: string): Promise<any>
}

class BacktestRepository implements IBacktestRepository {
    async create(userId: string, data: any): Promise<any> {
        console.log(userId, data)
    }

    async getById(userId: string, id: string): Promise<any> {
        return prisma.backtest.findUnique({
            where: { id, userId },
        })
    }

    async getAllByUserId(userId: string): Promise<any | null> {
        const [data, count] = await prisma.$transaction([
            prisma.backtest.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
            prisma.backtest.count({ where: { userId } }),
        ])
        return { data, count }
    }
}

export default BacktestRepository