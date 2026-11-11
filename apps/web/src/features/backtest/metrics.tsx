import { Dash, orDash } from "@/components/dash"
import type { GlossaryKey } from "@/constants/glossary"
import type { Formatters } from "@/lib/format"
import type { Benchmark } from "./types"
import { formatAmount, formatRecovery, fromDecimal } from "./utils"

export type Metric = "cagr" | "totalReturn" | "finalValue" | "volatility" | "sharpeRatio" | "maxDrawdown"

type MetricDefinition = { label: string; hint: GlossaryKey; format: (f: Formatters, value: number) => string }

/** Libellé, entrée du glossaire et format de chaque métrique d'un résultat, communs au détail et à la comparaison. */
export const metricDefinitions: Record<Metric, MetricDefinition> = {
    cagr: { label: "CAGR", hint: "cagr", format: (f, v) => f.formatRatio(v) },
    totalReturn: { label: "Rendement total", hint: "totalReturn", format: (f, v) => f.formatRatio(v) },
    finalValue: { label: "Valeur finale", hint: "finalValue", format: formatAmount },
    volatility: { label: "Volatilité", hint: "volatility", format: (f, v) => f.formatPercent(v) },
    sharpeRatio: { label: "Sharpe", hint: "sharpeRatio", format: (f, v) => f.formatSharpe(v) },
    maxDrawdown: { label: "Max drawdown", hint: "maxDrawdown", format: (f, v) => f.formatRatio(v) },
}

/** Libellé et aide de la ligne « Récupération », sans format : la valeur vient de `resultRecovery` / `benchmarkRecovery`. */
export const recoveryDefinition: Pick<MetricDefinition, "label" | "hint"> = { label: "Récupération", hint: "recovery" }

// Champs d'un résultat (détail ou comparaison) : Decimal sérialisé, null ou absent pour un résultat antérieur au champ
type ResultFields = Partial<Record<Metric, string | null>> & {
    recoveryDays?: number | null
    maxDrawdownPeakDate?: string | null
}

/** `cells` suivies, avec un benchmark, de `benchmarkCell(benchmark)` : la colonne du benchmark n'existe que s'il y en a un. */
export function withBenchmark<T>(
    cells: T[],
    benchmark: Benchmark | null | undefined,
    benchmarkCell: (benchmark: Benchmark) => T,
): T[] {
    return benchmark ? [...cells, benchmarkCell(benchmark)] : cells
}

/** Métrique d'un résultat, formatée ; `<Dash />` si elle manque. */
export const resultValue = (f: Formatters, result: ResultFields, metric: Metric) =>
    orDash(fromDecimal(result[metric]), (v) => metricDefinitions[metric].format(f, v))

/** Métrique d'un benchmark (nombre du moteur), formatée ; `<Dash />` si elle manque (`cagr` sous deux points). */
export const benchmarkValue = (f: Formatters, benchmark: Benchmark, metric: Metric) =>
    orDash(benchmark[metric], (v) => metricDefinitions[metric].format(f, v))

/** Récupération d'un résultat (`formatRecovery`) ; `<Dash />` pour un résultat antérieur au calcul. */
export const resultRecovery = (f: Formatters, result: ResultFields) =>
    formatRecovery(f, result.recoveryDays, fromDecimal(result.maxDrawdown), result.maxDrawdownPeakDate != null) ?? (
        <Dash />
    )

/** Récupération d'un benchmark : son plus haut est toujours daté par le moteur. */
export const benchmarkRecovery = (f: Formatters, benchmark: Benchmark) =>
    formatRecovery(f, benchmark.recoveryDays, benchmark.maxDrawdown, true) ?? <Dash />
