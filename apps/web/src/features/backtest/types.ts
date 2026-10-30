import type {
    Allocation,
    BacktestCompletedPayload,
    BacktestPreview,
    BacktestRequestedPayload,
    BacktestStats,
    BacktestStatus,
    DataSource,
    EquityPoint as CompletedEquityPoint,
    ExecutionRule,
    Holding,
    LumpSumComparison,
    Trade as CompletedTrade,
    TradeSide,
} from "@trading-plateform/contracts"

// Formes et unités des données du moteur : définies une seule fois dans les contrats
export type { DataSource, ExecutionRule, Holding, LumpSumComparison, TradeSide }

// Réponse de POST /api/backtest/preview : nombres prévus estimés sur le calendrier par core-backend
export type { BacktestPreview }

export type ExecutionStatus = BacktestStatus

export type InvestmentMode = BacktestRequestedPayload["investmentMode"]

export type RebalanceFrequency = BacktestRequestedPayload["rebalanceFrequency"]

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

// drawdown absent des résultats antérieurs à son calcul : la courbe de drawdown est alors masquée
export type EquityPoint = Omit<CompletedEquityPoint, "drawdown"> & Partial<Pick<CompletedEquityPoint, "drawdown">>

// quantity, amount, fee et side absents des résultats antérieurs à leur calcul ; side absent = achat (D10)
export type Trade = Pick<CompletedTrade, "date" | "symbol" | "price"> & Partial<Pick<CompletedTrade, "quantity" | "amount" | "fee" | "side">>

// Colonnes Decimal : sérialisées en string par l'API, null pour les résultats antérieurs au champ ; ratios en fraction
type DecimalField = "finalValue" | "totalInvested" | "totalFees" | "profit" | "totalReturn" | "maxDrawdown"

// Hypothèses de calcul enregistrées avec le résultat, null pour les résultats antérieurs à leur ajout
type AssumptionField = "executionRule" | "dataSource"

// Métriques de risque (D10) : Decimal sérialisé en string, cagr et volatility en fraction annuelle, sharpeRatio sans unité ;
// null ou absentes pour les résultats antérieurs
type MetricField = "cagr" | "volatility" | "sharpeRatio"

// holdings vide et lumpSumComparison null pour les résultats antérieurs ; lumpSumComparison null hors DCA
export type BacktestResult = Record<DecimalField, string | null> &
    Partial<Record<MetricField, string | null>> &
    Pick<BacktestCompletedPayload, "totalTrades" | "holdings" | "lumpSumComparison"> &
    Partial<Pick<BacktestCompletedPayload, "recoveryDays">> &
    { [K in AssumptionField]: BacktestCompletedPayload[K] | null } & {
        maxDrawdownDate: string | null // ISO
        maxDrawdownPeakDate?: string | null // ISO ; null sans baisse
        maxDrawdownRecoveryDate?: string | null // ISO ; null si non récupéré ou sans baisse
        equityCurve: EquityPoint[]
        trades: Trade[]
    }

export interface Backtest {
    id: string
    name: string
    allocations: (Pick<Allocation, "symbol"> & { weight: string })[] // weight : Decimal sérialisé en string, ratio ("0.34" = 34 %)
    startDate: string
    endDate: string
    investmentMode: InvestmentMode
    rebalanceFrequency: RebalanceFrequency // NONE pour les backtests antérieurs au rebalancement
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
