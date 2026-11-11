import { Dash, orDash } from "@/components/dash"
import type { GlossaryKey } from "@/constants/glossary"
import type { Formatters } from "@/lib/format"
import type { Benchmark } from "./types"
import { type BacktestTranslator, formatAmount, formatRecovery, fromDecimal } from "./utils"

export type Metric = "cagr" | "totalReturn" | "finalValue" | "volatility" | "sharpeRatio" | "maxDrawdown"

type MetricDefinition = { hint: GlossaryKey; format: (f: Formatters, value: number) => string }

/** Entrée du glossaire et format de chaque métrique d'un résultat, communs au détail et à la comparaison. */
export const metricDefinitions: Record<Metric, MetricDefinition> = {
    cagr: { hint: "cagr", format: (f, v) => f.formatRatio(v) },
    totalReturn: { hint: "totalReturn", format: (f, v) => f.formatRatio(v) },
    finalValue: { hint: "finalValue", format: formatAmount },
    volatility: { hint: "volatility", format: (f, v) => f.formatPercent(v) },
    sharpeRatio: { hint: "sharpeRatio", format: (f, v) => f.formatSharpe(v) },
    maxDrawdown: { hint: "maxDrawdown", format: (f, v) => f.formatRatio(v) },
}

/** Libellé (`metrics.<métrique>`) et aide d'une ligne de métrique. */
export const metricHead = (t: BacktestTranslator, metric: Metric) => ({
    label: t(`metrics.${metric}`),
    hint: metricDefinitions[metric].hint,
})

/** Libellé et aide de la ligne « Récupération » : la valeur vient de `resultRecovery` / `benchmarkRecovery`. */
export const recoveryHead = (t: BacktestTranslator) => ({ label: t("metrics.recovery"), hint: "recovery" as const })

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
export const resultRecovery = (f: Formatters, t: BacktestTranslator, result: ResultFields) =>
    formatRecovery(f, t, result.recoveryDays, fromDecimal(result.maxDrawdown), result.maxDrawdownPeakDate != null) ?? (
        <Dash />
    )

/** Récupération d'un benchmark : son plus haut est toujours daté par le moteur. */
export const benchmarkRecovery = (f: Formatters, t: BacktestTranslator, benchmark: Benchmark) =>
    formatRecovery(f, t, benchmark.recoveryDays, benchmark.maxDrawdown, true) ?? <Dash />
