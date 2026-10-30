import type {
    BacktestCompletedPayload,
    BacktestRequestedPayload,
    EquityPoint,
    Holding,
    LumpSumComparison,
    Trade as CompletedTrade,
} from "@trading-plateform/contracts"

// Formes et unités des données du moteur : définies une seule fois dans les contrats
export type { EquityPoint, Holding, LumpSumComparison }

export type ExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"

export type InvestmentMode = BacktestRequestedPayload["investmentMode"]

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

// quantity, amount et fee absents des résultats antérieurs à leur calcul
export type Trade = Pick<CompletedTrade, "date" | "symbol" | "price"> & Partial<Pick<CompletedTrade, "quantity" | "amount" | "fee">>

// Colonnes Decimal : sérialisées en string par l'API, null pour les résultats antérieurs au champ ; ratios en fraction
type DecimalField = "finalValue" | "totalInvested" | "totalFees" | "profit" | "totalReturn" | "maxDrawdown"

// holdings vide et lumpSumComparison null pour les résultats antérieurs ; lumpSumComparison null hors DCA
export type BacktestResult = Record<DecimalField, string | null> &
    Pick<BacktestCompletedPayload, "totalTrades" | "equityCurve" | "holdings" | "lumpSumComparison"> & {
        maxDrawdownDate: string | null // ISO
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
