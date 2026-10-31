"use client"

import { PriceAreaChart } from "@/components/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMediumDate, formatMonthTick, formatRate, formatRatio } from "@/lib/format"
import { cn } from "@/lib/utils"
import { BACKTEST_CURRENCY, comparisonSideColors } from "./constants"
import type { BacktestComparison } from "./types"
import { alignCurves, comparisonLabel, getComparisonBenchmark } from "./utils"

/**
 * Carte « Valeur des portefeuilles » de la comparaison (maquette 19 v2) : valeurs de A et B et, en pointillés, le benchmark
 * de A (sinon de B), puis leurs drawdowns sur le même axe des dates. Drawdown masqué si aucun des deux résultats n'en porte (résultats antérieurs).
 */
export function ComparisonOverview({ comparison }: { comparison: BacktestComparison }) {
    const { a, b } = comparison
    const { side: benchmarkSide, benchmark } = getComparisonBenchmark(comparison)
    const labelA = comparisonLabel("A", a.name)
    const labelB = comparisonLabel("B", b.name)
    const benchmarkLabel = benchmark ? `Benchmark ${benchmark.symbol}` : undefined
    const hasDrawdown = [...a.result.equityCurve, ...b.result.equityCurve].some((p) => p.drawdown != null)
    const legend = [
        { label: labelA, className: cn("h-[3px]", comparisonSideColors.a.className) },
        { label: labelB, className: cn("h-[3px]", comparisonSideColors.b.className) },
        ...(benchmarkLabel ? [{ label: benchmarkLabel, className: "h-0.5 bg-muted-foreground" }] : []),
    ]

    return (
        <Card className="gap-4">
            <CardHeader className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-body-semibold">Valeur des portefeuilles</CardTitle>
                    <CardDescription className="text-small">Drawdown sous la courbe, même axe temporel</CardDescription>
                </div>
                <ul className="flex flex-wrap items-center gap-4">
                    {legend.map(({ label, className }) => (
                        <li key={label} className="flex items-center gap-1.5 text-small text-muted-foreground">
                            <span className={cn("w-3 rounded-xs", className)} />
                            {label}
                        </li>
                    ))}
                </ul>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <PriceAreaChart
                    data={alignCurves(a.result.equityCurve, b.result.equityCurve, (p) => p.value, benchmarkSide)}
                    formatTick={formatMonthTick}
                    formatTooltipDate={formatMediumDate}
                    label={labelA}
                    color={comparisonSideColors.a.stroke}
                    otherLabel={labelB}
                    otherColor={comparisonSideColors.b.stroke}
                    compareLabel={benchmarkLabel}
                    currency={BACKTEST_CURRENCY}
                    hideXAxis={hasDrawdown}
                    className="h-56"
                />
                {hasDrawdown && (
                    <>
                        <span className="text-small font-medium text-muted-foreground">Drawdown</span>
                        <PriceAreaChart
                            data={alignCurves(a.result.equityCurve, b.result.equityCurve, (p) => p.drawdown, benchmarkSide)}
                            formatTick={formatMonthTick}
                            formatTooltipDate={formatMediumDate}
                            formatAxis={formatRate}
                            formatValue={formatRatio}
                            label={labelA}
                            color={comparisonSideColors.a.stroke}
                            otherLabel={labelB}
                            otherColor={comparisonSideColors.b.stroke}
                            className="h-24"
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
