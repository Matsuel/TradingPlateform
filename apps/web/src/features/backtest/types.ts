export type ExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"

export type InvestmentMode = "LUMP_SUM" | "RECURRING"

export interface BacktestExecution {
    id: string
    status: ExecutionStatus
    attempt: number
    createdAt: string
    startedAt: string | null
    finishedAt: string | null
    error: string | null
    result?: { totalReturn: string | null; totalTrades: number } | null // Decimal sérialisé en string, fraction (0,342 = 34,2 %)
}

export interface EquityPoint {
    date: string // YYYY-MM-DD
    value: number
    invested: number
}

export interface Trade {
    date: string // YYYY-MM-DD
    symbol: string
    price: number // cours d'achat
}

// Decimal sérialisés en string ; ratios en fraction
export interface BacktestResult {
    finalValue: string | null
    totalInvested: string | null
    totalReturn: string | null
    totalTrades: number
    maxDrawdown: string | null
    maxDrawdownDate: string | null
    equityCurve: EquityPoint[]
    trades: Trade[]
}

export interface Backtest {
    id: string
    name: string
    symbols: string[]
    startDate: string
    endDate: string
    investmentMode: InvestmentMode
    createdAt: string
    executions: BacktestExecution[] // la plus récente en premier
}

// Réponse de GET /api/backtest/stats (BacktestStats côté backend), selon le statut de la dernière exécution ; rates en fraction
export interface BacktestListStats {
    total: number
    active: number
    completed: number
    failed: number
    completedRate: number
    failedRate: number
}

export interface BacktestDetails extends Backtest {
    executions: BacktestExecution[] // toutes, la plus récente en premier
    result: BacktestResult | null // dernier résultat terminé
}
