import type {
    Allocation,
    BacktestBatch,
    BacktestBatchRow,
    BacktestBatchSummary,
    BacktestComparison,
    BacktestCompletedPayload,
    BacktestPreview,
    BacktestRequestedPayload,
    BacktestStats,
    BacktestStatus,
    Benchmark,
    ComparedBacktest,
    ComparedMetric,
    ComparisonParameter,
    EquityPoint as CompletedEquityPoint,
    Trade as CompletedTrade,
    DataSource,
    DividendEvent,
    ExecutionRule,
    Holding,
    LumpSumComparison,
    RollingWindow,
    TradeSide,
} from "@azimut/contracts"

// Formes et unités définies une seule fois dans les contrats : données du moteur (résultat, benchmark), réponse de
// POST /api/backtest/preview (nombres prévus estimés par core-backend) et de GET /api/backtest/compare (écarts A − B)
export type {
    BacktestBatch,
    BacktestBatchRow,
    BacktestBatchSummary,
    BacktestComparison,
    BacktestPreview,
    Benchmark,
    ComparedBacktest,
    ComparedMetric,
    ComparisonParameter,
    DataSource,
    DividendEvent,
    ExecutionRule,
    Holding,
    LumpSumComparison,
    RollingWindow,
    TradeSide,
}

// Ligne d'allocation saisie : poids en pourcent entier (60 = 60 %, D2), converti en ratio par le backend ; NaN = champ vidé
export type AllocationInput = Pick<Allocation, "symbol"> & { name?: string; weight: number }

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
    // Cause stable de l'échec (`ExecutionErrorCode`), traduite par le web ; absente ou null pour les échecs antérieurs
    errorCode?: string | null
    // Decimal sérialisé en string, fraction (0,342 = 34,2 %) ; cagr absent ou null pour les résultats antérieurs
    result?: { totalReturn: string | null; totalTrades: number; cagr?: string | null } | null
}

// drawdown absent des résultats antérieurs à son calcul : la courbe de drawdown est alors masquée
export type EquityPoint = Omit<CompletedEquityPoint, "drawdown"> & Partial<Pick<CompletedEquityPoint, "drawdown">>

// quantity, amount, fee et side absents des résultats antérieurs à leur calcul ; side absent = achat (D10)
export type Trade = Pick<CompletedTrade, "date" | "symbol" | "price"> &
    Partial<Pick<CompletedTrade, "quantity" | "amount" | "fee" | "side">>

// Colonnes Decimal : sérialisées en string par l'API, null pour les résultats antérieurs au champ ; ratios en fraction
type DecimalField = "finalValue" | "totalInvested" | "totalFees" | "profit" | "totalReturn" | "maxDrawdown"

// Hypothèses de calcul enregistrées avec le résultat, null pour les résultats antérieurs à leur ajout
type AssumptionField = "executionRule" | "dataSource"

// Métriques de risque (D10) : Decimal sérialisé en string, cagr, volatility et riskFreeRate (taux sans risque du Sharpe)
// en fraction annuelle, sharpeRatio sans unité ; null ou absentes pour les résultats antérieurs.
// priceReturn : rendement sans dividendes (fraction) ; dividendTotal, dividendGain : euros
type MetricField =
    | "cagr"
    | "volatility"
    | "sharpeRatio"
    | "riskFreeRate"
    | "priceReturn"
    | "dividendTotal"
    | "dividendGain"

// holdings vide et lumpSumComparison null pour les résultats antérieurs ; lumpSumComparison null hors DCA ;
// benchmark null sans benchmark, absent ou null pour les résultats antérieurs ; dividendEvents et returnBreakdown : tels que
// publiés par le moteur, absents ou null pour les résultats antérieurs
export type BacktestResult = Record<DecimalField, string | null> &
    Partial<Record<MetricField, string | null>> &
    Pick<BacktestCompletedPayload, "totalTrades" | "holdings" | "lumpSumComparison"> &
    Partial<
        Pick<
            BacktestCompletedPayload,
            "recoveryDays" | "rebalanceCount" | "benchmark" | "dividendEvents" | "returnBreakdown" | "rollingSummary"
        >
    > & {
        [K in AssumptionField]: BacktestCompletedPayload[K] | null
    } & {
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
    feeRate: string // Decimal sérialisé en string, fraction par ordre, achat ou vente ("0.001" = 0,1 %)
    benchmarkSymbol: BacktestRequestedPayload["benchmarkSymbol"] // null sans benchmark et pour les backtests antérieurs
    createdAt: string
    batchId: string | null // lot de départs auquel le backtest appartient, null hors lot
    executions: BacktestExecution[] // la plus récente en premier
}

// Réponse de GET /api/backtest/stats ; nom distinct du composant BacktestStats
export type BacktestListStats = BacktestStats

export interface BacktestDetails extends Backtest {
    executions: BacktestExecution[] // toutes, la plus récente en premier
    result: BacktestResult | null // dernier résultat terminé
}
