import type { PaginationQuery } from "@trading-plateform/contracts"
import { prisma } from "../prisma"
import type { BacktestExecution, BacktestStatus, Prisma } from "../generated/prisma/client"
import type { BacktestDetails, BacktestStatusCounts, BacktestWithExecutions, CompleteExecutionDTO, CreateBacktestDTO } from "../interfaces/backtest.interface"

export interface IBacktestRepository {
    create(data: CreateBacktestDTO): Promise<BacktestWithExecutions>
    getById(id: string): Promise<BacktestWithExecutions | null>
    getDetailsById(id: string): Promise<BacktestDetails | null>
    getAllByUserId(userId: string, pagination: PaginationQuery, statuses?: BacktestStatus[]): Promise<{ data: BacktestWithExecutions[], count: number }>
    countByLatestStatus(userId: string): Promise<BacktestStatusCounts>
    createExecution(backtestId: string, attempt: number): Promise<BacktestExecution>
    updateExecution(id: string, from: BacktestStatus[], data: Prisma.BacktestExecutionUpdateManyMutationInput): Promise<boolean>
    completeExecution(id: string, from: BacktestStatus[], data: CompleteExecutionDTO): Promise<boolean>
}

const executionSummary = {
    // Dernière exécution en premier ; attempt départage deux createdAt identiques
    orderBy: [{ createdAt: "desc" }, { attempt: "desc" }],
    include: { result: { omit: { equityCurve: true, trades: true, holdings: true, lumpSumComparison: true } } },
} satisfies Prisma.Backtest$executionsArgs

const latestExecution = {
    executions: { ...executionSummary, take: 1 },
} satisfies Prisma.BacktestInclude

class BacktestRepository implements IBacktestRepository {
    async create(data: CreateBacktestDTO): Promise<BacktestWithExecutions> {
        return prisma.$transaction(async (tx) => {
            const { id, executions: [execution] } = await tx.backtest.create({
                data: { ...data, executions: { create: {} } },
                include: { executions: true },
            })
            return tx.backtest.update({
                where: { id },
                data: { latestExecutionId: execution!.id },
                include: latestExecution,
            })
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
                orderBy: [{ execution: { createdAt: "desc" } }, { execution: { attempt: "desc" } }],
            }),
        ])
        return backtest && { ...backtest, result }
    }

    async getAllByUserId(userId: string, { page, pageSize }: PaginationQuery, statuses?: BacktestStatus[]): Promise<{ data: BacktestWithExecutions[], count: number }> {
        const where = {
            userId,
            ...(statuses && { latestExecution: { is: { status: { in: statuses } } } }),
        } satisfies Prisma.BacktestWhereInput
        const [data, count] = await prisma.$transaction([
            prisma.backtest.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: latestExecution,
            }),
            prisma.backtest.count({ where }),
        ])
        return { data, count }
    }

    async countByLatestStatus(userId: string): Promise<BacktestStatusCounts> {
        const [total, groups] = await Promise.all([
            prisma.backtest.count({ where: { userId } }),
            prisma.backtestExecution.groupBy({
                by: ["status"],
                where: { latestOf: { is: { userId } } },
                _count: { _all: true },
            }),
        ])
        return { total, byStatus: groups.map(({ status, _count }) => ({ status, count: _count._all })) }
    }

    async createExecution(backtestId: string, attempt: number): Promise<BacktestExecution> {
        return prisma.$transaction(async (tx) => {
            const execution = await tx.backtestExecution.create({ data: { backtestId, attempt } })
            await tx.backtest.update({ where: { id: backtestId }, data: { latestExecutionId: execution.id } })
            return execution
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
