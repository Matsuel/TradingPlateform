import type {
    ComparedMetric,
    DataSource,
    ExecutionStatus,
    InvestmentMode,
    RebalanceFrequency,
    TradeSide,
} from "./types"

// Devise des montants saisis : les cours ne sont pas convertis
export const BACKTEST_CURRENCY = "EUR"

// Total des poids d'une allocation, en pourcent entier (D2)
export const FULL_PERCENT = 100

// Actifs d'une allocation au plus : market-service accepte 50 symboles par requête de cours (`MAX_CLOSES_SYMBOLS` des contrats,
// non importable ici : le front n'embarque pas zod) et le benchmark en prend un
export const MAX_ALLOCATIONS = 49

// Dates de départ d'un lot (D1) : bornes de `BATCH_START_DATES_LIMITS` des contrats (valeur non importable ici, voir ci-dessus)
export const MIN_START_DATES = 2
export const MAX_START_DATES = 10
// Un départ de lot précède la fin commune d'au moins un an (`BATCH_MIN_YEARS_BEFORE_END` des contrats)
export const MIN_YEARS_BEFORE_END = 1
// Durée de fenêtre lue par la carte « Fenêtres négatives » et choisie par défaut dans le graphique (`BATCH_SUMMARY_WINDOW_YEARS`)
export const SUMMARY_WINDOW_YEARS = 3

// Une exécution dans ces statuts peut encore évoluer
export const activeStatuses = ["PENDING", "RUNNING"] as const satisfies readonly ExecutionStatus[]

// Libellés : `backtest.investmentMode.<mode>` dans les dictionnaires
export const investmentModes = ["LUMP_SUM", "RECURRING"] as const satisfies readonly InvestmentMode[]

// Libellés : `backtest.rebalanceFrequency.<fréquence>`
export const rebalanceFrequencies = [
    "NONE",
    "MONTHLY",
    "QUARTERLY",
    "YEARLY",
] as const satisfies readonly RebalanceFrequency[]

// Valeurs initiales du formulaire et du test rapide : capital en `BACKTEST_CURRENCY`, frais en pourcent par ordre
export const DEFAULT_INVESTMENT_MODE = "LUMP_SUM" satisfies InvestmentMode
export const DEFAULT_INITIAL_AMOUNT = 10_000
export const DEFAULT_FEE_PERCENT = 0.1

// Valeur par défaut du formulaire et du test rapide, comme le défaut du schéma du backend
export const DEFAULT_REBALANCE_FREQUENCY = "NONE" satisfies RebalanceFrequency

// Benchmark proposé par le formulaire (D9) : ETF iShares MSCI World
export const DEFAULT_BENCHMARK_SYMBOL = "URTH"

export const dataProviderLabels: Record<DataSource["provider"], string> = {
    "yahoo-finance2": "Yahoo Finance",
}

// Étapes d'une exécution, dans l'ordre, affichées par le récapitulatif du formulaire (maquette 12) ; textes : `backtest.preview.steps.<étape>`
export const previewSteps = ["data", "simulation", "metrics"] as const

// Couleur du badge de chaque statut ; le libellé vient de `backtest.status.<statut>`
export const statusVariants: Record<ExecutionStatus, "outline" | "destructive" | "secondary" | "success"> = {
    DRAFT: "secondary",
    PENDING: "outline",
    RUNNING: "outline",
    COMPLETED: "success",
    FAILED: "destructive",
    CANCELLED: "secondary",
}

// Couleur du badge de chaque côté d'un ordre ; le libellé vient de `backtest.tradeSide.<côté>`
export const tradeSideVariants: Record<TradeSide, "success" | "destructive"> = { BUY: "success", SELL: "destructive" }

// Onglets de filtre de la liste ; libellés : `backtest.filters.<filtre>`
export const statusFilters = {
    all: { statuses: [] },
    running: { statuses: activeStatuses },
    done: { statuses: ["COMPLETED"] },
    failed: { statuses: ["FAILED"] },
} as const satisfies Record<string, { statuses: readonly ExecutionStatus[] }>

export type StatusFilter = keyof typeof statusFilters

// Backtests proposés au choix de la comparaison : MAX_PAGE_SIZE de @trading-plateform/contracts (pagination.ts), pageSize
// maximal de GET /api/backtest ; recopié car le web n'importe pas le package à l'exécution
export const COMPARABLE_LIMIT = 100

// Couleur de chaque côté de la comparaison (maquette 14) : courbes, légende et pastilles de sélection
export const comparisonSideColors = {
    a: { stroke: "var(--chart-1)", className: "bg-chart-1" },
    b: { stroke: "var(--chart-2)", className: "bg-chart-2" },
} as const

// Sens favorable d'un écart A − B, pour le colorer : une volatilité plus haute est défavorable
export const comparedMetricHigherIsBetter: Record<ComparedMetric, boolean> = {
    cagr: true,
    totalReturn: true,
    volatility: false,
    sharpeRatio: true,
    // Ratio ≤ 0 : un écart positif = baisse maximale moins profonde
    maxDrawdown: true,
}
