import Dash from "@/components/custom/Dash"
import type { PricePoint } from "@/components/chart"
import { formatDuration, formatPrice, formatRate } from "@/lib/format"
import { activeStatuses, BACKTEST_CURRENCY } from "./constants"
import type { Backtest, BacktestComparison, BacktestExecution, EquityPoint, ExecutionStatus } from "./types"

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

/** Allocation lisible : « AAPL 60 % · MSFT 40 % » (poids en ratio, au pourcent entier, D2). */
export const formatAllocation = (allocations: Backtest["allocations"]) =>
    allocations.map(({ symbol, weight }) => `${symbol} ${formatRate(Number(weight))}`).join(" · ")

/** Decimal sérialisé en string par l'API → number ; null ou absent → null (champ absent des résultats antérieurs). */
export const fromDecimal = (value: string | null | undefined) => (value == null ? null : Number(value))

/** Valeur formatée, ou `<Dash />` si elle manque (résultat antérieur, moins de deux points). */
export const show = (value: number | null, format: (v: number) => string) => (value == null ? <Dash /> : format(value))

/** Montant en `BACKTEST_CURRENCY`. */
export const formatAmount = (v: number) => formatPrice(v, BACKTEST_CURRENCY)

/**
 * Durée de récupération ; `recoveryDays` null : « Aucune baisse » sans baisse, « Non récupéré » si la baisse a un plus haut
 * daté par le moteur (`peakDated`), `<Dash />` sinon : résultat antérieur au calcul, où l'API renvoie aussi null.
 */
export function formatRecovery(recoveryDays: number | null | undefined, maxDrawdown: number | null, peakDated: boolean) {
    if (recoveryDays != null) return formatDuration(recoveryDays)
    if (maxDrawdown == null) return <Dash />
    if (maxDrawdown === 0) return "Aucune baisse"
    return peakDated ? "Non récupéré" : <Dash />
}

/** Libellé d'un côté de la comparaison : « A · 60/40 ». */
export const comparisonLabel = (side: "A" | "B", name: string) => `${side} · ${name}`

/** Benchmark affiché par la comparaison : celui de A, sinon celui de B ; `benchmark` null si aucun des deux n'en a. */
export function getComparisonBenchmark({ a, b }: BacktestComparison) {
    const side = a.result.benchmark || !b.result.benchmark ? "a" : "b"
    return { side, benchmark: (side === "a" ? a : b).result.benchmark } as const
}

/**
 * Aligne les courbes de A et B sur l'union de leurs dates, triées, pour un même graphique : `price` = série de A (null
 * les jours hors de sa période), `other` = série de B, `compare` = benchmark du côté `benchmarkSide` (`getComparisonBenchmark`).
 * `value` choisit la série (valeur, drawdown).
 */
export function alignCurves(a: EquityPoint[], b: EquityPoint[], value: (p: EquityPoint) => number | undefined, benchmarkSide: "a" | "b"): PricePoint[] {
    const points = new Map<string, PricePoint>()
    const at = (date: string): PricePoint => points.get(date) ?? { date, price: null }
    for (const p of a) points.set(p.date, { ...at(p.date), price: value(p) ?? null, ...(benchmarkSide === "a" && { compare: p.benchmarkValue }) })
    for (const p of b) points.set(p.date, { ...at(p.date), other: value(p), ...(benchmarkSide === "b" && { compare: p.benchmarkValue }) })
    return [...points.values()].sort((x, y) => x.date.localeCompare(y.date))
}
