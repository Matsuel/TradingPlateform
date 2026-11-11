import { useTranslations } from "next-intl"
import { Dash, orDash } from "@/components/dash"
import { type HintDetail, InfoHint } from "@/components/info-hint"
import { type Formatters, useFormatters } from "@/lib/format"
import { MetricBlock, type MetricColumn, type MetricRow } from "./metric-block"
import {
    benchmarkRecovery,
    benchmarkValue,
    type Metric,
    metricHead,
    recoveryHead,
    resultRecovery,
    resultValue,
    withBenchmark,
} from "./metrics"
import type { BacktestResult, RebalanceFrequency } from "./types"
import { type BacktestTranslator, formatAmount, fromDecimal } from "./utils"

// Lignes des blocs, dans l'ordre de la maquette 13 v2
const performanceMetrics: Metric[] = ["cagr", "totalReturn", "finalValue"]
const riskMetrics: Metric[] = ["volatility", "sharpeRatio", "maxDrawdown"]

// Colonnes : le portefeuille puis, avec un benchmark, son symbole
const columnsOf = (t: BacktestTranslator, { benchmark }: BacktestResult): MetricColumn[] =>
    withBenchmark([{ label: t("result.portfolio") }], benchmark, (bm) => ({ label: bm.symbol }))

// Ligne d'une métrique : valeur du portefeuille puis, avec un benchmark, la sienne
function metricRow(
    f: Formatters,
    t: BacktestTranslator,
    result: BacktestResult,
    metric: Metric,
    details?: HintDetail[],
): MetricRow {
    const values = withBenchmark([resultValue(f, result, metric)], result.benchmark, (bm) =>
        benchmarkValue(f, bm, metric),
    )
    return { ...metricHead(t, metric), details, values }
}

function recoveryRow(f: Formatters, t: BacktestTranslator, result: BacktestResult): MetricRow {
    return {
        ...recoveryHead(t),
        values: withBenchmark([resultRecovery(f, t, result)], result.benchmark, (bm) => benchmarkRecovery(f, t, bm)),
    }
}

// Note du bloc Performance en DCA : valeur d'un investissement unique et écart avec le DCA
function LumpSumNote({ lumpSum }: { lumpSum: NonNullable<BacktestResult["lumpSumComparison"]> }) {
    const f = useFormatters()
    const t = useTranslations("backtest.result.lumpSum")
    const { finalValue, dcaAdvantage } = lumpSum
    return (
        <>
            <InfoHint
                entry="lumpSum"
                details={[
                    { label: t("single"), value: formatAmount(f, finalValue) },
                    { label: t("dcaGap"), value: formatAmount(f, dcaAdvantage) },
                ]}
            >
                {t("label")}
            </InfoHint>
            {` : ${t("summary", {
                final: formatAmount(f, finalValue),
                gap: formatAmount(f, Math.abs(dcaAdvantage)),
                direction: dcaAdvantage >= 0 ? "less" : "more",
            })}`}
        </>
    )
}

function PerformanceBlock({ result }: { result: BacktestResult }) {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const { lumpSumComparison } = result
    return (
        <MetricBlock
            title={t("result.performance.title")}
            description={t("result.performance.description")}
            columns={columnsOf(t, result)}
            rows={performanceMetrics.map((metric) => metricRow(f, t, result, metric))}
            note={lumpSumComparison && <LumpSumNote lumpSum={lumpSumComparison} />}
        />
    )
}

function RiskBlock({ result }: { result: BacktestResult }) {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const { maxDrawdownDate, maxDrawdownPeakDate } = result
    const riskFreeRate = fromDecimal(result.riskFreeRate)
    const troughDetails = maxDrawdownDate
        ? [{ label: t("result.risk.trough"), value: f.formatDay(maxDrawdownDate) }]
        : []

    return (
        <MetricBlock
            title={t("result.risk.title")}
            description={
                riskFreeRate == null
                    ? t("result.risk.annualised")
                    : t("result.risk.annualisedRiskFree", { rate: f.formatPercent(riskFreeRate) })
            }
            columns={columnsOf(t, result)}
            rows={[
                ...riskMetrics.map((metric) =>
                    metricRow(f, t, result, metric, metric === "maxDrawdown" ? troughDetails : undefined),
                ),
                recoveryRow(f, t, result),
            ]}
            note={maxDrawdownPeakDate && t("result.risk.peak", { date: f.formatDay(maxDrawdownPeakDate) })}
        />
    )
}

function CostsBlock({ result, rebalanceFrequency }: ResultMetricsProps) {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const rebalancing =
        rebalanceFrequency === "NONE"
            ? t("result.costs.noRebalancing")
            : t("result.costs.rebalancing", { frequency: t(`rebalanceFrequency.${rebalanceFrequency}`).toLowerCase() })

    return (
        <MetricBlock
            title={t("result.costs.title")}
            description={t("result.costs.description", { rebalancing })}
            columns={[{ label: t("result.costs.total") }]}
            rows={[
                {
                    label: t("result.costs.fees"),
                    hint: "totalFees",
                    values: [orDash(fromDecimal(result.totalFees), (v) => formatAmount(f, v))],
                },
                { label: t("result.costs.trades"), hint: "totalTrades", values: [result.totalTrades] },
                {
                    label: t("result.costs.rebalances"),
                    hint: "rebalanceCount",
                    values: [result.rebalanceCount ?? <Dash />],
                },
            ]}
        />
    )
}

interface ResultMetricsProps {
    result: BacktestResult
    rebalanceFrequency: RebalanceFrequency
}

/**
 * Indicateurs d'un résultat en trois blocs (performance, risque, coûts et activité), tous calculés par le moteur :
 * le front ne fait que les formater. Avec un benchmark, une seconde colonne affiche ses métriques.
 * Un champ absent d'un résultat antérieur (`cagr` null, D10) s'affiche `<Dash />`.
 */
export function ResultMetrics({ result, rebalanceFrequency }: ResultMetricsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <PerformanceBlock result={result} />
            <RiskBlock result={result} />
            <CostsBlock result={result} rebalanceFrequency={rebalanceFrequency} />
        </div>
    )
}
