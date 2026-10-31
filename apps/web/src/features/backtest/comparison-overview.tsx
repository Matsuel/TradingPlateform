"use client"

import { PriceAreaChart } from "@/components/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMediumDate, formatMonthTick, formatRate, formatRatio } from "@/lib/format"
import { cn } from "@/lib/utils"
import { BACKTEST_CURRENCY } from "./constants"
import type { BacktestComparison } from "./types"
import { alignCurves } from "./utils"

/**
 * Carte « Valeur des portefeuilles » de la comparaison (maquette 19 v2) : valeurs de A et B et, en pointillés, le benchmark
 * de A, puis leurs drawdowns sur le même axe des dates. Drawdown masqué si aucun des deux résultats n'en porte (résultats antérieurs).
 */
export function ComparisonOverview({ comparison }: { comparison: BacktestComparison }) {
    const { a, b } = comparison
    const { benchmark } = a.result
    const labelA = `A · ${a.name}`
    const labelB = `B · ${b.name}`
    const benchmarkLabel = benchmark ? `Benchmark ${benchmark.symbol}` : undefined
    const hasDrawdown = [...a.result.equityCurve, ...b.result.equityCurve].some((p) => p.drawdown != null)
    const legend = [
        { label: labelA, className: "h-[3px] bg-chart-1" },
        { label: labelB, className: "h-[3px] bg-chart-2" },
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
                    data={alignCurves(a.result.equityCurve, b.result.equityCurve, (p) => p.value)}
                    formatTick={formatMonthTick}
                    formatTooltipDate={formatMediumDate}
                    label={labelA}
                    color="var(--chart-1)"
                    otherLabel={labelB}
                    otherColor="var(--chart-2)"
                    compareLabel={benchmarkLabel}
                    currency={BACKTEST_CURRENCY}
                    hideXAxis={hasDrawdown}
                    className="h-56"
                />
                {hasDrawdown && (
                    <>
                        <span className="text-small font-medium text-muted-foreground">Drawdown</span>
                        <PriceAreaChart
                            data={alignCurves(a.result.equityCurve, b.result.equityCurve, (p) => p.drawdown)}
                            formatTick={formatMonthTick}
                            formatTooltipDate={formatMediumDate}
                            formatAxis={formatRate}
                            formatValue={formatRatio}
                            label={labelA}
                            color="var(--chart-1)"
                            otherLabel={labelB}
                            otherColor="var(--chart-2)"
                            className="h-24"
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
