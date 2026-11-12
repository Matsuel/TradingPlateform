import type { BacktestStatus } from "../generated/prisma/client"

// Une exécution dans ces statuts peut encore évoluer
export const ACTIVE_STATUSES: BacktestStatus[] = ["PENDING", "RUNNING"]

// Une exécution active plus ancienne que cela est déclarée échouée : l'engine a planté ou le message s'est perdu
export const EXECUTION_TIMEOUT_MS = 15 * 60_000

// Intervalle entre deux balayages des exécutions expirées
export const STALE_SWEEP_INTERVAL_MS = 60_000

// Seul un résultat terminé est comparable (GET /api/backtest/compare)
export const COMPARABLE_STATUSES: BacktestStatus[] = ["COMPLETED"]
