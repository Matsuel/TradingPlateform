export type ExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"

export interface BacktestExecution {
    id: string
    status: ExecutionStatus
    startedAt: string | null
    finishedAt: string | null
    result?: { totalReturn: string | null } | null // Decimal sérialisé en string, fraction (0,342 = 34,2 %)
}

export interface Backtest {
    id: string
    name: string
    symbols: string[]
    startDate: string
    endDate: string
    investmentMode: "LUMP_SUM" | "RECURRING"
    createdAt: string
    executions: BacktestExecution[] // la plus récente en premier
}
