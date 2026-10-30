import type { DataSource, ExecutionRule, ExecutionStatus, InvestmentMode, RebalanceFrequency, TradeSide } from "./types"

// Devise des montants saisis : les cours ne sont pas convertis
export const BACKTEST_CURRENCY = "EUR"

// Une exécution dans ces statuts peut encore évoluer
export const activeStatuses = ["PENDING", "RUNNING"] as const satisfies readonly ExecutionStatus[]

export const investmentModeOptions: { value: InvestmentMode; label: string }[] = [
    { value: "LUMP_SUM", label: "Investissement unique" },
    { value: "RECURRING", label: "Investissement unique + versements mensuels" },
]

export const rebalanceFrequencyLabels: Record<RebalanceFrequency, string> = {
    NONE: "Aucun",
    MONTHLY: "Mensuel",
    QUARTERLY: "Trimestriel",
    YEARLY: "Annuel",
}

// Valeur par défaut du formulaire et du test rapide, comme le défaut de createBacktestSchema
export const DEFAULT_REBALANCE_FREQUENCY = "NONE" satisfies RebalanceFrequency

export const rebalanceFrequencyOptions = Object.entries(rebalanceFrequencyLabels).map(([value, label]) => ({ value, label }))

export const strategyLabels: Record<InvestmentMode, string> = {
    RECURRING: "DCA mensuel",
    LUMP_SUM: "Lump sum",
}

export const executionRuleLabels: Record<ExecutionRule, string> = {
    CLOSE_ON_SCHEDULED_DAY: "Achat à la clôture du premier jour de cotation de chaque échéance",
}

export const dataProviderLabels: Record<DataSource["provider"], string> = {
    "yahoo-finance2": "Yahoo Finance",
}

export const priceTypeLabels: Record<DataSource["priceType"], string> = {
    CLOSE_SPLIT_ADJUSTED: "Clôture ajustée des splits, hors dividendes",
}

// Étapes d'une exécution, dans l'ordre, affichées par le récapitulatif du formulaire (maquette 12.1)
export const previewSteps = [
    { label: "Données", description: "Cours de clôture journaliers des actifs" },
    { label: "Simulation", description: "Versements, ordres et rebalancements" },
    { label: "Métriques", description: "Rendement, risque et drawdown" },
] as const

// Taux sans risque du Sharpe, en fraction : miroir d'affichage de la constante de l'engine (D5)
export const RISK_FREE_RATE = 0

export const BACKTEST_DISCLAIMER =
    "Les performances passées ne préjugent pas des performances futures. Simulation pédagogique, pas un conseil en investissement."

export const statusBadges: Record<ExecutionStatus, { label: string; variant: "outline" | "destructive" | "secondary" | "success" }> = {
    DRAFT: { label: "Brouillon", variant: "secondary" },
    PENDING: { label: "En attente", variant: "outline" },
    RUNNING: { label: "En cours", variant: "outline" },
    COMPLETED: { label: "Terminé", variant: "success" },
    FAILED: { label: "Échoué", variant: "destructive" },
    CANCELLED: { label: "Annulé", variant: "secondary" },
}

export const tradeSideBadges: Record<TradeSide, { label: string; variant: "success" | "destructive" }> = {
    BUY: { label: "Achat", variant: "success" },
    SELL: { label: "Vente", variant: "destructive" },
}

export const statusFilters = {
    all: { label: "Tous", statuses: [] },
    running: { label: "En cours", statuses: activeStatuses },
    done: { label: "Terminés", statuses: ["COMPLETED"] },
    failed: { label: "Échoués", statuses: ["FAILED"] },
} as const satisfies Record<string, { label: string; statuses: readonly ExecutionStatus[] }>

export type StatusFilter = keyof typeof statusFilters
