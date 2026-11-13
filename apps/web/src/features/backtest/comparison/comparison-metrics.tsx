import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { Dash } from "@/components/dash"
import { useFormatters } from "@/lib/format"
import { trendOf, trendStyles } from "@/lib/trend"
import { comparedMetricHigherIsBetter } from "../constants"
import { MetricBlock, type MetricColumn, type MetricRow } from "../metric-block"
import {
    benchmarkRecovery,
    benchmarkValue,
    metricHead,
    recoveryHead,
    resultRecovery,
    resultValue,
    withBenchmark,
} from "../metrics"
import type { BacktestComparison, Benchmark, ComparedBacktest, ComparedMetric } from "../types"
import { type BacktestTranslator, comparisonLabel, getComparisonBenchmark } from "../utils"

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
    return (
        <span className={trendStyles[trendOf(value, comparedMetricHigherIsBetter[metric])].text}>{format(value)}</span>
    )
}

// Format de l'écart A − B : points de ratio (0.044 → « +4,4 pts »), sauf le Sharpe, sans unité
function useDeltaFormat(t: BacktestTranslator) {
    const { formatChange, formatPointChange } = useFormatters()
    const formatPoints = (ratio: number) => t("compare.metrics.points", { value: formatPointChange(ratio * 100) })

    return (metric: ComparedMetric) => (metric === "sharpeRatio" ? formatChange : formatPoints)
}

// Colonnes : A, B, l'écart puis, avec un benchmark, son symbole
const comparisonColumns = (
    t: BacktestTranslator,
    { a, b }: BacktestComparison,
    benchmark: Parameters<typeof withBenchmark>[1],
): MetricColumn[] =>
    withBenchmark<MetricColumn>(
        [
            { label: comparisonLabel("A", a.name) },
            { label: comparisonLabel("B", b.name) },
            { label: t("compare.metrics.delta"), hint: "comparisonDelta" },
        ],
        benchmark,
        (bm) => ({ label: bm.symbol }),
    )

// Lignes qui ont un écart, dans l'ordre de la maquette ; récupération et valeur finale suivent, sans écart
const metricsWithDelta: ComparedMetric[] = ["cagr", "totalReturn", "volatility", "sharpeRatio", "maxDrawdown"]

type ComparedResult = ComparedBacktest["result"]

/**
 * Tableau « Métriques comparées » (maquette 14) : A, B, écart A − B calculé par le backend (`deltas`) et, si A (sinon
 * B) a un benchmark, ses métriques. Récupération et valeur finale n'ont pas d'écart. `<Dash />` pour une valeur absente.
 */
export function ComparisonMetrics({ comparison }: { comparison: BacktestComparison }) {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const deltaFormat = useDeltaFormat(t)
    const { a, b, deltas } = comparison
    const { benchmark } = getComparisonBenchmark(comparison)
    const columns = comparisonColumns(t, comparison, benchmark)
    // Valeur de A, de B, écart puis, avec un benchmark, la sienne
    const row = (
        { label, hint }: Pick<MetricRow, "label" | "hint">,
        valueOf: (result: ComparedResult) => ReactNode,
        delta: ReactNode,
        benchmarkCell: (benchmark: Benchmark) => ReactNode,
    ): MetricRow => ({
        label,
        hint,
        values: withBenchmark([valueOf(a.result), valueOf(b.result), delta], benchmark, benchmarkCell),
    })

    const rows = [
        ...metricsWithDelta.map((metric) =>
            row(
                metricHead(t, metric),
                (r) => resultValue(f, r, metric),
                <Delta metric={metric} value={deltas[metric]} format={deltaFormat(metric)} />,
                (bm) => benchmarkValue(f, bm, metric),
            ),
        ),
        row(
            recoveryHead(t),
            (r) => resultRecovery(f, t, r),
            <Dash />,
            (bm) => benchmarkRecovery(f, t, bm),
        ),
        row(
            metricHead(t, "finalValue"),
            (r) => resultValue(f, r, "finalValue"),
            <Dash />,
            (bm) => benchmarkValue(f, bm, "finalValue"),
        ),
    ]

    return (
        <MetricBlock
            title={t("compare.metrics.title")}
            description={t("compare.metrics.description")}
            rowHeader={t("metrics.rowHeader")}
            columns={columns}
            boldColumns={2}
            rows={rows}
        />
    )
}
