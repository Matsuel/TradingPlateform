import type {
    Allocation,
    BacktestCompletedPayload,
    BacktestRequestedPayload,
    BacktestStats,
    BacktestStatus,
    DataSource,
    EquityPoint,
    ExecutionRule,
    Holding,
    LumpSumComparison,
    Trade as CompletedTrade,
} from "@trading-plateform/contracts"

// Formes et unités des données du moteur : définies une seule fois dans les contrats
export type { DataSource, EquityPoint, ExecutionRule, Holding, LumpSumComparison }

export type ExecutionStatus = BacktestStatus

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

// Hypothèses de calcul enregistrées avec le résultat, null pour les résultats antérieurs à leur ajout
type AssumptionField = "executionRule" | "dataSource"

// holdings vide et lumpSumComparison null pour les résultats antérieurs ; lumpSumComparison null hors DCA
export type BacktestResult = Record<DecimalField, string | null> &
    Pick<BacktestCompletedPayload, "totalTrades" | "equityCurve" | "holdings" | "lumpSumComparison"> &
    { [K in AssumptionField]: BacktestCompletedPayload[K] | null } & {
        maxDrawdownDate: string | null // ISO
        trades: Trade[]
    }

export interface Backtest {
    id: string
    name: string
    allocations: (Pick<Allocation, "symbol"> & { weight: string })[] // weight : Decimal sérialisé en string, ratio ("0.34" = 34 %)
    startDate: string
    endDate: string
    investmentMode: InvestmentMode
    feeRate: string // Decimal sérialisé en string, fraction par achat ("0.001" = 0,1 %)
    createdAt: string
    executions: BacktestExecution[] // la plus récente en premier
}

// Réponse de GET /api/backtest/stats ; nom distinct du composant BacktestStats
export type BacktestListStats = BacktestStats

export interface BacktestDetails extends Backtest {
    executions: BacktestExecution[] // toutes, la plus récente en premier
    result: BacktestResult | null // dernier résultat terminé
}
