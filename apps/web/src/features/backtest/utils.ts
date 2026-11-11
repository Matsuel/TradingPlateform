import type { useTranslations } from "next-intl"
import type { ChartPoint } from "@/components/area-series-chart"
import type { Formatters } from "@/lib/format"
import { activeStatuses, BACKTEST_CURRENCY } from "./constants"
import type {
    AllocationInput,
    Backtest,
    BacktestComparison,
    BacktestExecution,
    EquityPoint,
    ExecutionStatus,
} from "./types"

/** Traducteur du namespace `backtest` des dictionnaires, passé aux helpers qui produisent du texte. */
export type BacktestTranslator = ReturnType<typeof useTranslations<"backtest">>

/** Somme des poids saisis, en pourcent ; un poids vidé (`NaN`) compte 0 (le schéma du formulaire le rejette à part). */
export const allocationTotal = (rows: AllocationInput[]) =>
    rows.reduce((sum, r) => sum + (Number.isNaN(r.weight) ? 0 : r.weight), 0)

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
export function getExecutionDuration(t: BacktestTranslator, e: BacktestExecution) {
    if (!e.finishedAt) return null
    const seconds = Math.max(1, Math.round((+new Date(e.finishedAt) - +new Date(e.startedAt ?? e.createdAt)) / 1000))
    const minutes = Math.floor(seconds / 60)
    return minutes
        ? t("duration.minutesSeconds", { minutes, seconds: seconds % 60 })
        : t("duration.seconds", { seconds })
}

/** Allocation lisible : « AAPL 60 % · MSFT 40 % » (poids en ratio, au pourcent entier, D2). */
export const formatAllocation = (f: Formatters, allocations: Backtest["allocations"]) =>
    allocations.map(({ symbol, weight }) => `${symbol} ${f.formatRate(Number(weight))}`).join(" · ")

/** Decimal sérialisé en string par l'API → number ; null ou absent → null (champ absent des résultats antérieurs). */
export const fromDecimal = (value: string | null | undefined) => (value == null ? null : Number(value))

/** Montant en `BACKTEST_CURRENCY`. */
export const formatAmount = (f: Formatters, v: number) => f.formatPrice(v, BACKTEST_CURRENCY)

/**
 * Durée de récupération ; `recoveryDays` null : « Aucune baisse » sans baisse, « Non récupéré » si la baisse a un plus haut
 * daté par le moteur (`peakDated`), `null` sinon (l'écran affiche `<Dash />`) : résultat antérieur au calcul, où l'API renvoie aussi null.
 */
export function formatRecovery(
    f: Formatters,
    t: BacktestTranslator,
    recoveryDays: number | null | undefined,
    maxDrawdown: number | null,
    peakDated: boolean,
): string | null {
    if (recoveryDays != null) return f.formatDuration(recoveryDays)
    if (maxDrawdown == null) return null
    if (maxDrawdown === 0) return t("recovery.noDrawdown")
    return peakDated ? t("recovery.notRecovered") : null
}

/** Nom de la série du benchmark dans un graphique : « Benchmark URTH ». */
export const benchmarkLabel = (t: BacktestTranslator, symbol: string) => t("benchmarkLabel", { symbol })

/** Libellé d'un côté de la comparaison : « A · 60/40 ». */
export const comparisonLabel = (side: "A" | "B", name: string) => `${side} · ${name}`

/** Benchmark affiché par la comparaison : celui de A, sinon celui de B ; `benchmark` null si aucun des deux n'en a. */
export function getComparisonBenchmark({ a, b }: BacktestComparison) {
    const side = a.result.benchmark || !b.result.benchmark ? "a" : "b"
    return { side, benchmark: (side === "a" ? a : b).result.benchmark } as const
}

/**
 * Aligne les courbes de A et B sur l'union de leurs dates, triées, pour un même graphique : séries `a` et `b` (absentes
 * les jours hors de la période d'un côté) et, avec `benchmarkSide`, `benchmark` = benchmark de ce côté
 * (`getComparisonBenchmark`). `value` choisit la série (valeur, drawdown).
 */
export function alignCurves(
    a: EquityPoint[],
    b: EquityPoint[],
    value: (p: EquityPoint) => number | undefined,
    benchmarkSide?: "a" | "b",
): ChartPoint[] {
    const points = new Map<string, ChartPoint>()
    const add = (side: "a" | "b", curve: EquityPoint[]) => {
        for (const p of curve) {
            const point = points.get(p.date) ?? { date: p.date }
            points.set(p.date, {
                ...point,
                [side]: value(p),
                ...(benchmarkSide === side && { benchmark: p.benchmarkValue }),
            })
        }
    }
    add("a", a)
    add("b", b)
    return [...points.values()].sort((x, y) => x.date.localeCompare(y.date))
}
