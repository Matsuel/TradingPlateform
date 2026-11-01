"use client"

import type { ChartSeries } from "@/components/area-series-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { comparisonSideColors } from "./constants"
import type { BacktestComparison } from "./types"
import { alignCurves, comparisonLabel, getComparisonBenchmark } from "./utils"
import { ValueDrawdownCharts } from "./value-drawdown-charts"

/**
 * Carte « Valeur des portefeuilles » de la comparaison (maquette 14) : valeurs de A et B et, en pointillés, le benchmark
 * de A (sinon de B), puis leurs drawdowns sur le même axe des dates. Drawdown masqué si aucun des deux résultats n'en
 * porte (résultats antérieurs).
 */
export function ComparisonOverview({ comparison }: { comparison: BacktestComparison }) {
    const { a, b } = comparison
    const { side: benchmarkSide, benchmark } = getComparisonBenchmark(comparison)
    const curves = [a.result.equityCurve, b.result.equityCurve] as const
    const sides = (["a", "b"] as const).map((side) => ({
        key: side,
        label: comparisonLabel(side === "a" ? "A" : "B", comparison[side].name),
        color: comparisonSideColors[side].stroke,
    }))
    const benchmarkSeries: ChartSeries[] = benchmark
        ? [{ key: "benchmark", label: `Benchmark ${benchmark.symbol}`, color: "var(--muted-foreground)", dashed: true }]
        : []
    const hasDrawdown = curves.some((curve) => curve.some((p) => p.drawdown != null))
    const legend = [
        ...sides.map((s) => ({ label: s.label, className: cn("h-[3px]", comparisonSideColors[s.key].className) })),
        ...benchmarkSeries.map((s) => ({ label: s.label, className: "h-0.5 bg-muted-foreground" })),
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
            <CardContent>
                <ValueDrawdownCharts
                    value={{
                        data: alignCurves(...curves, (p) => p.value, benchmarkSide),
                        series: [...sides, ...benchmarkSeries],
                    }}
                    drawdown={{ data: hasDrawdown ? alignCurves(...curves, (p) => p.drawdown) : [], series: sides }}
                />
            </CardContent>
        </Card>
    )
}
