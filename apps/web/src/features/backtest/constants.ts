import type { ExecutionStatus, InvestmentMode } from "./types"

export const strategyOptions = [
    { value: "dca", label: "DCA — investir un montant chaque mois" },
    { value: "lump_sum", label: "Lump sum — investir en une seule fois" },
]

export const strategyLabels: Record<InvestmentMode, string> = {
    RECURRING: "DCA mensuel",
    LUMP_SUM: "Lump sum",
}

export const statusBadges: Record<ExecutionStatus, { label: string; variant: "outline" | "destructive" | "secondary" | "success" }> = {
    PENDING: { label: "En attente", variant: "outline" },
    RUNNING: { label: "En cours", variant: "outline" },
    COMPLETED: { label: "Terminé", variant: "success" },
    FAILED: { label: "Échoué", variant: "destructive" },
    CANCELLED: { label: "Annulé", variant: "secondary" },
}

export const statusFilters = {
    all: { label: "Tous", statuses: [] },
    running: { label: "En cours", statuses: ["PENDING", "RUNNING"] },
    done: { label: "Terminés", statuses: ["COMPLETED"] },
    failed: { label: "Échoués", statuses: ["FAILED"] },
} as const satisfies Record<string, { label: string; statuses: readonly ExecutionStatus[] }>

export type StatusFilter = keyof typeof statusFilters
