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

// quantity, amount et fee absents des résultats antérieurs à leur calcul
export interface Trade {
    date: string // YYYY-MM-DD
    symbol: string
    price: number // cours d'achat
    quantity?: number // titres achetés, fractionnaire
    amount?: number // montant versé, frais compris
    fee?: number
}

// Position en fin de simulation, valorisée au dernier cours
export interface Holding {
    symbol: string
    quantity: number
    value: number
}

// Même total versé investi en une fois au premier jour ; ratios en fraction
export interface LumpSumComparison {
    finalValue: number
    totalReturn: number
    maxDrawdown: number // ≤ 0
    dcaAdvantage: number // valeur finale DCA − investissement unique : > 0 si le DCA fait mieux
    equityCurve: { date: string; value: number }[] // mêmes dates que la courbe du DCA
}

// Decimal sérialisés en string ; ratios en fraction
export interface BacktestResult {
    finalValue: string | null
    totalInvested: string | null
    totalFees: string | null // null pour les résultats antérieurs au calcul des frais
    totalReturn: string | null
    totalTrades: number
    maxDrawdown: string | null
    maxDrawdownDate: string | null
    equityCurve: EquityPoint[]
    trades: Trade[]
    holdings: Holding[] // vide pour les résultats antérieurs
    lumpSumComparison: LumpSumComparison | null // null hors DCA et pour les résultats antérieurs
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
