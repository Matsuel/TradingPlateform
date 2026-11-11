import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { useFormatters } from "@/lib/format"
import { NO_BENCHMARK_LABEL, rebalanceFrequencyLabels, strategyLabels } from "./constants"
import { MetricBlock } from "./metric-block"
import type { BacktestComparison, ComparedBacktest, ComparisonParameter } from "./types"

/**
 * Tableau « Paramètres » (maquette 14) : période, mode, allocation, rebalancement, frais et benchmark de A et B ;
 * badge « diffère » sur les paramètres que le backend signale dans `differences`.
 */
export function ComparisonParameters({ comparison }: { comparison: BacktestComparison }) {
    const { formatDayRange, formatPercent, formatRate } = useFormatters()
    const { a, b, differences } = comparison
    const values = (value: (backtest: ComparedBacktest) => ReactNode) => [value(a), value(b)]
    const differs = (parameter: ComparisonParameter) =>
        differences.includes(parameter) && <Badge variant="outline">diffère</Badge>

    return (
        <MetricBlock
            title="Paramètres"
            description="Ceux qui diffèrent sont signalés"
            rowHeader="Paramètre"
            columns={[{ label: "A" }, { label: "B" }]}
            boldColumns={0}
            rows={[
                {
                    label: "Période",
                    badge: differs("period"),
                    values: values((t) => formatDayRange(t.startDate, t.endDate)),
                },
                { label: "Mode", hint: "investmentMode", values: values((t) => strategyLabels[t.investmentMode]) },
                {
                    label: "Allocation",
                    hint: "allocation",
                    values: values((t) =>
                        t.allocations.map(({ symbol, weight }) => (
                            <div key={symbol}>
                                {symbol} {formatRate(Number(weight))}
                            </div>
                        )),
                    ),
                },
                {
                    label: "Rebalancement",
                    hint: "rebalanceFrequency",
                    values: values((t) => rebalanceFrequencyLabels[t.rebalanceFrequency]),
                },
                {
                    label: "Frais",
                    hint: "feeRate",
                    badge: differs("feeRate"),
                    values: values((t) => formatPercent(Number(t.feeRate))),
                },
                {
                    label: "Benchmark",
                    hint: "benchmark",
                    badge: differs("benchmarkSymbol"),
                    values: values((t) => t.benchmarkSymbol ?? NO_BENCHMARK_LABEL),
                },
            ]}
        />
    )
}
