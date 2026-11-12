"use client"

import { useTranslations } from "next-intl"
import { type ChartSeries, referenceSeries } from "@/components/area-series-chart"
import { ChartLegend } from "@/components/chart-legend"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { comparisonSideColors } from "./constants"
import type { BacktestComparison } from "./types"
import { alignCurves, benchmarkLabel, comparisonLabel, getComparisonBenchmark } from "./utils"
import { ValueDrawdownCharts } from "./value-drawdown-charts"

/**
 * Carte « Valeur des portefeuilles » de la comparaison (maquette 14) : valeurs de A et B et, en pointillés, le benchmark
 * de A (sinon de B), puis leurs drawdowns sur le même axe des dates. Drawdown masqué si aucun des deux résultats n'en
 * porte (résultats antérieurs).
 */
export function ComparisonOverview({ comparison }: { comparison: BacktestComparison }) {
    const t = useTranslations("backtest")
    const { side: benchmarkSide, benchmark } = getComparisonBenchmark(comparison)
    const curves = [comparison.a.result.equityCurve, comparison.b.result.equityCurve] as const
    const sides: ChartSeries[] = (["a", "b"] as const).map((side) => ({
        key: side,
        label: comparisonLabel(side === "a" ? "A" : "B", comparison[side].name),
        color: comparisonSideColors[side].stroke,
    }))
    const valueSeries = benchmark
        ? [
              ...sides,
              referenceSeries({ key: "benchmark", label: benchmarkLabel(t, benchmark.symbol), hint: "benchmark" }),
          ]
        : sides
    const hasDrawdown = curves.some((curve) => curve.some((p) => p.drawdown != null))

    return (
        <Card size="compact">
            <CardHeader className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <CardTitle>{t("compare.overview.title")}</CardTitle>
                    <CardDescription>{t("compare.overview.description")}</CardDescription>
                </div>
                <ChartLegend series={valueSeries} />
            </CardHeader>
            <CardContent>
                <ValueDrawdownCharts
                    value={{ data: alignCurves(...curves, (p) => p.value, benchmarkSide), series: valueSeries }}
                    drawdown={{ data: hasDrawdown ? alignCurves(...curves, (p) => p.drawdown) : [], series: sides }}
                />
            </CardContent>
        </Card>
    )
}
