import type { PaginationQuery } from "@trading-plateform/contracts"
import type { Portfolio } from "../generated/prisma/client"
import type { CreatePortfolioDTO, UpdatePortfolioDTO } from "../interfaces/portfolio.interface"
import { prisma } from "../prisma"

export interface IPortfolioRepository {
    create(data: CreatePortfolioDTO): Promise<Portfolio>
    getById(id: string): Promise<Portfolio | null>
    getAllByUserId(userId: string, pagination: PaginationQuery): Promise<{ data: Portfolio[], count: number }>
    update(id: string, data: UpdatePortfolioDTO): Promise<Portfolio>
    delete(id: string): Promise<Portfolio>
}

class PortfolioRepository implements IPortfolioRepository {
    async create(data: CreatePortfolioDTO): Promise<Portfolio> {
        return prisma.portfolio.create({
            data,
        })
    }

    async getById(id: string): Promise<Portfolio | null> {
        return prisma.portfolio.findUnique({
            where: { id },
        })
    }

    async getAllByUserId(userId: string, { page, pageSize }: PaginationQuery): Promise<{ data: Portfolio[], count: number }> {
        const [data, count] = await prisma.$transaction([
            prisma.portfolio.findMany({
                where: { userId },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.portfolio.count({ where: { userId } }),
        ])
        return { data, count }
    }

    async update(id: string, data: UpdatePortfolioDTO): Promise<Portfolio> {
        return prisma.portfolio.update({
            where: { id },
            data,
        })
    }

    async delete(id: string): Promise<Portfolio> {
        return prisma.portfolio.delete({
            where: { id },
        })
    }
}

export default PortfolioRepository