"use client"

import { useTranslations } from "next-intl"
import { type ChartSeries, referenceSeries } from "@/components/area-series-chart"
import { ChartLegend } from "@/components/chart-legend"
import { InfoHint } from "@/components/info-hint"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFormatters } from "@/lib/format"
import type { BacktestResult } from "./types"
import { formatAmount, fromDecimal } from "./utils"
import { ValueDrawdownCharts } from "./value-drawdown-charts"

// Courbe de valeur avec dividendes réinvestis et, en pointillés, le même portefeuille sans dividendes ; absente d'un
// résultat sans dividende perçu (aucun `priceOnlyValue`)
export function DividendValueChart({ result }: { result: BacktestResult }) {
    const f = useFormatters()
    const t = useTranslations("backtest.dividends.chart")
    const { equityCurve } = result
    const gap = fromDecimal(result.dividendGain)
    if (!equityCurve.some((point) => point.priceOnlyValue != null)) return null

    const series: ChartSeries[] = [
        { key: "value", label: t("reinvested"), color: "var(--success)", fill: true },
        referenceSeries({ key: "compare", label: t("priceOnly") }),
    ]
    const points = equityCurve.map((point) => ({ date: point.date, value: point.value, compare: point.priceOnlyValue }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>
                    {t("description", {
                        from: equityCurve[0]!.date.slice(0, 4),
                        to: equityCurve.at(-1)!.date.slice(0, 4),
                    })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <ChartLegend series={series} />
                <ValueDrawdownCharts value={{ data: points, series }} drawdown={{ data: [], series: [] }} />
                {gap != null && (
                    <p className="text-small text-muted-foreground">
                        <InfoHint entry="dividendGain">{t("gap", { amount: formatAmount(f, gap) })}</InfoHint>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
