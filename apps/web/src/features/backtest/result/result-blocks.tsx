import { useTranslations } from "next-intl"
import { Dash, orDash } from "@/components/dash"
import { useFormatters } from "@/lib/format"
import { MetricBlock } from "./metric-block"
import { type Metric, metricRow, recoveryRow, resultColumns } from "./metrics"
import type { BacktestResult, RebalanceFrequency } from "./types"
import { formatAmount, fromDecimal } from "./utils"

const riskMetrics: Metric[] = ["volatility", "sharpeRatio", "maxDrawdown"]

/** Bloc « Risque » : volatilité, Sharpe, drawdown (creux daté en détail) et récupération. */
export function RiskBlock({ result }: { result: BacktestResult }) {
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
            columns={resultColumns(t, result)}
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

/** Bloc « Coûts et activité » : frais payés, ordres et rebalancements. */
export function CostsBlock({
    result,
    rebalanceFrequency,
}: {
    result: BacktestResult
    rebalanceFrequency: RebalanceFrequency
}) {
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
