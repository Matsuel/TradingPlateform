import type { ReactNode } from "react"
import { Dash } from "@/components/dash"
import { formatChange, LOCALE } from "@/lib/format"
import { cn } from "@/lib/utils"
import { comparedMetricHigherIsBetter } from "./constants"
import { MetricBlock, type MetricRow } from "./metric-block"
import { benchmarkRecovery, benchmarkValue, metricDefinitions, resultRecovery, resultValue } from "./metrics"
import type { BacktestComparison, Benchmark, ComparedBacktest, ComparedMetric } from "./types"
import { comparisonLabel, getComparisonBenchmark } from "./utils"

// Écart en points de ratio (0.044 → « +4,4 pts »)
const formatPointChange = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "always",
}).format
const formatPoints = (ratio: number) => `${formatPointChange(ratio * 100)} pts`

// Écart A − B de l'API, vert s'il est favorable à A, rouge sinon
function Delta({
    metric,
    value,
    format,
}: {
    metric: ComparedMetric
    value: number | null
    format: (v: number) => string
}) {
    if (value == null) return <Dash />
    const favorable = value === 0 ? null : value > 0 === comparedMetricHigherIsBetter[metric]
    return (
        <span className={cn(favorable === true && "text-success", favorable === false && "text-destructive")}>
            {format(value)}
        </span>
    )
}

// Format de l'écart A − B : points de ratio, sauf le Sharpe, sans unité
const deltaFormats: Record<ComparedMetric, (value: number) => string> = {
    cagr: formatPoints,
    totalReturn: formatPoints,
    volatility: formatPoints,
    sharpeRatio: formatChange,
    maxDrawdown: formatPoints,
}

// Lignes qui ont un écart, dans l'ordre de la maquette ; récupération et valeur finale suivent, sans écart
const metricsWithDelta: ComparedMetric[] = ["cagr", "totalReturn", "volatility", "sharpeRatio", "maxDrawdown"]

type ComparedResult = ComparedBacktest["result"]

/**
 * Tableau « Métriques comparées » (maquette 14) : A, B, écart A − B calculé par le backend (`deltas`) et, si A (sinon
 * B) a un benchmark, ses métriques. Récupération et valeur finale n'ont pas d'écart. `<Dash />` pour une valeur absente.
 */
export function ComparisonMetrics({ comparison }: { comparison: BacktestComparison }) {
    const { a, b, deltas } = comparison
    const { benchmark } = getComparisonBenchmark(comparison)
    const columns = [
        comparisonLabel("A", a.name),
        comparisonLabel("B", b.name),
        "Écart",
        ...(benchmark ? [benchmark.symbol] : []),
    ]
    // Valeur de A, de B, écart puis, avec un benchmark, la sienne
    const row = (
        { label, hint }: Pick<MetricRow, "label" | "hint">,
        valueOf: (result: ComparedResult) => ReactNode,
        delta: ReactNode,
        benchmarkCell: (benchmark: Benchmark) => ReactNode,
    ): MetricRow => ({
        label,
        hint,
        values: [valueOf(a.result), valueOf(b.result), delta, ...(benchmark ? [benchmarkCell(benchmark)] : [])],
    })

    const rows = [
        ...metricsWithDelta.map((metric) =>
            row(
                metricDefinitions[metric],
                (r) => resultValue(r, metric),
                <Delta metric={metric} value={deltas[metric]} format={deltaFormats[metric]} />,
                (bm) => benchmarkValue(bm, metric),
            ),
        ),
        row({ label: "Récupération", hint: "recovery" }, resultRecovery, <Dash />, benchmarkRecovery),
        row(
            metricDefinitions.finalValue,
            (r) => resultValue(r, "finalValue"),
            <Dash />,
            (bm) => benchmarkValue(bm, "finalValue"),
        ),
    ]

    return (
        <MetricBlock
            title="Métriques comparées"
            description="Écart = A − B, en points (Sharpe sans unité)"
            rowHeader="Indicateur"
            columns={columns}
            columnHints={{ Écart: "comparisonDelta" }}
            strong={2}
            rows={rows}
        />
    )
}
