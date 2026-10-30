import { formatRate } from "@/lib/format"
import { activeStatuses } from "./constants"
import type { Backtest, BacktestExecution, ExecutionStatus } from "./types"

/** Dernière exécution d'un backtest (l'API les trie de la plus récente à la plus ancienne). */
export const getExecution = (b: Backtest) => b.executions[0]

/** Vrai si la dernière exécution a l'un des statuts donnés ; faux sans exécution. */
export function hasStatus(b: Backtest, statuses: readonly ExecutionStatus[]) {
    const status = getExecution(b)?.status
    return status !== undefined && statuses.includes(status)
}

/** Exécution en attente ou en cours : miroir d'affichage de la règle backend « une exécution active à la fois ». */
export const isActive = (e: BacktestExecution) => (activeStatuses as readonly ExecutionStatus[]).includes(e.status)

/** Durée lisible d'une exécution terminée (« 1 min 5 s »), depuis son démarrage ; null tant qu'elle n'est pas finie. */
export function getExecutionDuration(e: BacktestExecution) {
    if (!e.finishedAt) return null
    const seconds = Math.max(1, Math.round((+new Date(e.finishedAt) - +new Date(e.startedAt ?? e.createdAt)) / 1000))
    const minutes = Math.floor(seconds / 60)
    return minutes ? `${minutes} min ${seconds % 60} s` : `${seconds} s`
}

/** Decimal sérialisé en string par l'API → number ; null ou absent → null (champ absent des résultats antérieurs). */
/** Allocation lisible : « AAPL 60 % · MSFT 40 % » (poids en ratio, au pourcent entier, D2). */
export const formatAllocation = (allocations: Backtest["allocations"]) =>
    allocations.map(({ symbol, weight }) => `${symbol} ${formatRate(Number(weight))}`).join(" · ")

export const fromDecimal = (value: string | null | undefined) => (value == null ? null : Number(value))
