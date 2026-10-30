import type { DataSource, ExecutionRule, ExecutionStatus, InvestmentMode, TradeSide } from "./types"

// Devise des montants saisis : les cours ne sont pas convertis
export const BACKTEST_CURRENCY = "EUR"

// Une exécution dans ces statuts peut encore évoluer
export const activeStatuses = ["PENDING", "RUNNING"] as const satisfies readonly ExecutionStatus[]

export const investmentModeOptions: { value: InvestmentMode; label: string }[] = [
    { value: "LUMP_SUM", label: "Investissement unique" },
    { value: "RECURRING", label: "Investissement unique + versements mensuels" },
]

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
