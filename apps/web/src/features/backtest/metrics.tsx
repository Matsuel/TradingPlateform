import { Dash, orDash } from "@/components/dash"
import type { GlossaryKey } from "@/constants/glossary"
import { formatPercent, formatRatio, formatSharpe } from "@/lib/format"
import type { Benchmark } from "./types"
import { formatAmount, formatRecovery, fromDecimal } from "./utils"

export type Metric = "cagr" | "totalReturn" | "finalValue" | "volatility" | "sharpeRatio" | "maxDrawdown"

type MetricDefinition = { label: string; hint: GlossaryKey; format: (value: number) => string }

/** Libellé, entrée du glossaire et format de chaque métrique d'un résultat, communs au détail et à la comparaison. */
export const metricDefinitions: Record<Metric, MetricDefinition> = {
    cagr: { label: "CAGR", hint: "cagr", format: formatRatio },
    totalReturn: { label: "Rendement total", hint: "totalReturn", format: formatRatio },
    finalValue: { label: "Valeur finale", hint: "finalValue", format: formatAmount },
    volatility: { label: "Volatilité", hint: "volatility", format: formatPercent },
    sharpeRatio: { label: "Sharpe", hint: "sharpeRatio", format: formatSharpe },
    maxDrawdown: { label: "Max drawdown", hint: "maxDrawdown", format: formatRatio },
}

/** Libellé et aide de la ligne « Récupération », sans format : la valeur vient de `resultRecovery` / `benchmarkRecovery`. */
export const recoveryDefinition: Pick<MetricDefinition, "label" | "hint"> = { label: "Récupération", hint: "recovery" }

// Champs d'un résultat (détail ou comparaison) : Decimal sérialisé, null ou absent pour un résultat antérieur au champ
type ResultFields = Partial<Record<Metric, string | null>> & {
    recoveryDays?: number | null
    maxDrawdownPeakDate?: string | null
}

/** Métrique d'un résultat, formatée ; `<Dash />` si elle manque. */
export const resultValue = (result: ResultFields, metric: Metric) =>
    orDash(fromDecimal(result[metric]), metricDefinitions[metric].format)

/** Métrique d'un benchmark (nombre du moteur), formatée ; `<Dash />` si elle manque (`cagr` sous deux points). */
export const benchmarkValue = (benchmark: Benchmark, metric: Metric) =>
    orDash(benchmark[metric], metricDefinitions[metric].format)

/** Récupération d'un résultat (`formatRecovery`) ; `<Dash />` pour un résultat antérieur au calcul. */
export const resultRecovery = (result: ResultFields) =>
    formatRecovery(result.recoveryDays, fromDecimal(result.maxDrawdown), result.maxDrawdownPeakDate != null) ?? <Dash />

/** Récupération d'un benchmark : son plus haut est toujours daté par le moteur. */
export const benchmarkRecovery = (benchmark: Benchmark) =>
    formatRecovery(benchmark.recoveryDays, benchmark.maxDrawdown, true) ?? <Dash />
