import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { useFormatters } from "@/lib/format"
import { MetricBlock } from "./metric-block"
import type { BacktestComparison, ComparedBacktest, ComparisonParameter } from "./types"

/**
 * Tableau « Paramètres » (maquette 14) : période, mode, allocation, rebalancement, frais et benchmark de A et B ;
 * badge « diffère » sur les paramètres que le backend signale dans `differences`.
 */
export function ComparisonParameters({ comparison }: { comparison: BacktestComparison }) {
    const { formatDayRange, formatPercent, formatRate } = useFormatters()
    const t = useTranslations("backtest")
    const { a, b, differences } = comparison
    const values = (value: (backtest: ComparedBacktest) => ReactNode) => [value(a), value(b)]
    const differs = (parameter: ComparisonParameter) =>
        differences.includes(parameter) && <Badge variant="outline">{t("compare.parameters.differs")}</Badge>

    return (
        <MetricBlock
            title={t("compare.parameters.title")}
            description={t("compare.parameters.description")}
            rowHeader={t("compare.parameters.rowHeader")}
            columns={[{ label: "A" }, { label: "B" }]}
            boldColumns={0}
            rows={[
                {
                    label: t("compare.parameters.period"),
                    badge: differs("period"),
                    values: values((c) => formatDayRange(c.startDate, c.endDate)),
                },
                {
                    label: t("compare.parameters.mode"),
                    hint: "investmentMode",
                    values: values((c) => t(`strategy.${c.investmentMode}`)),
                },
                {
                    label: t("compare.parameters.allocation"),
                    hint: "allocation",
                    values: values((c) =>
                        c.allocations.map(({ symbol, weight }) => (
                            <div key={symbol}>
                                {symbol} {formatRate(Number(weight))}
                            </div>
                        )),
                    ),
                },
                {
                    label: t("compare.parameters.rebalancing"),
                    hint: "rebalanceFrequency",
                    values: values((c) => t(`rebalanceFrequency.${c.rebalanceFrequency}`)),
                },
                {
                    label: t("compare.parameters.fees"),
                    hint: "feeRate",
                    badge: differs("feeRate"),
                    values: values((c) => formatPercent(Number(c.feeRate))),
                },
                {
                    label: t("compare.parameters.benchmark"),
                    hint: "benchmark",
                    badge: differs("benchmarkSymbol"),
                    values: values((c) => c.benchmarkSymbol ?? t("noBenchmark")),
                },
            ]}
        />
    )
}
