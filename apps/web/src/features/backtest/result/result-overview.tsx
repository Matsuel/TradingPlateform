"use client"

import { useTranslations } from "next-intl"
import { type ChartSeries, referenceSeries } from "@/components/area-series-chart"
import { ChartLegend } from "@/components/chart-legend"
import { Dash } from "@/components/dash"
import { InfoHint } from "@/components/info-hint"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useFormatters } from "@/lib/format"
import { type Trend, trendOf, trendStyles } from "@/lib/trend"
import type { BacktestResult } from "../types"
import { type BacktestTranslator, benchmarkLabel, formatAmount, fromDecimal } from "../utils"
import { ValueDrawdownCharts } from "./value-drawdown-charts"

// Valeur finale et rendement total
function ResultHeadline({ result }: { result: BacktestResult }) {
    const f = useFormatters()
    const t = useTranslations("backtest.overview")
    const finalValue = fromDecimal(result.finalValue)
    const totalReturn = fromDecimal(result.totalReturn)
    const finalValueText = finalValue == null ? undefined : formatAmount(f, finalValue)

    return (
        <>
            <span className="text-body-medium text-muted-foreground">
                <InfoHint entry="finalValue" value={finalValueText}>
                    {t("finalValue")}
                </InfoHint>
            </span>
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-h1">{finalValueText ?? <Dash />}</span>
                {totalReturn != null && (
                    <Badge variant={trendStyles[trendOf(totalReturn)].badge}>{f.formatRatio(totalReturn)}</Badge>
                )}
            </div>
        </>
    )
}

// Plus-value sur le montant investi et, avec un benchmark, son rendement ; rien pour un résultat antérieur
function ProfitLine({ result }: { result: BacktestResult }) {
    const f = useFormatters()
    const t = useTranslations("backtest.overview")
    const { benchmark } = result
    const profit = fromDecimal(result.profit)
    const invested = fromDecimal(result.totalInvested)
    if (profit == null || invested == null) return null

    return (
        <p className="text-body text-muted-foreground">
            <InfoHint entry="profit" value={formatAmount(f, profit)}>
                {t("profit")}
            </InfoHint>{" "}
            {formatAmount(f, profit)} {t("on")}{" "}
            <InfoHint entry="totalInvested" value={formatAmount(f, invested)}>
                {t("invested", { amount: formatAmount(f, invested) })}
            </InfoHint>
            {benchmark &&
                ` · ${t("benchmarkReturn", { symbol: benchmark.symbol, return: f.formatRatio(benchmark.totalReturn) })}`}
        </p>
    )
}

// Séries de la courbe de valeur : le portefeuille, puis en pointillés le benchmark s'il existe, sinon l'investissement
// unique (DCA) ; aucune pour un résultat antérieur sans l'un ni l'autre
function valueSeriesOf(t: BacktestTranslator, { benchmark, equityCurve }: BacktestResult, trend: Trend): ChartSeries[] {
    const portfolio: ChartSeries = {
        key: "value",
        label: t("overview.portfolio"),
        color: trendStyles[trend].color,
        fill: true,
        hint: "equityCurve",
    }
    if (benchmark)
        return [
            portfolio,
            referenceSeries({ key: "compare", label: benchmarkLabel(t, benchmark.symbol), hint: "benchmark" }),
        ]
    if (equityCurve.some((p) => p.lumpSumValue != null))
        return [portfolio, referenceSeries({ key: "compare", label: t("overview.lumpSum"), hint: "lumpSum" })]
    return [portfolio]
}

const drawdownSeries = (t: BacktestTranslator): ChartSeries => ({
    key: "drawdown",
    label: t("overview.drawdown"),
    color: "var(--destructive)",
    fill: true,
    hint: "drawdownCurve",
})

/**
 * Carte principale d'un résultat : `ResultHeadline`, `ProfitLine` et `ChartLegend`, puis la courbe de valeur et, dessous,
 * la courbe de drawdown (`ValueDrawdownCharts`). Drawdown masqué pour un résultat antérieur dont les points n'ont pas
 * de `drawdown`.
 */
export function ResultOverview({ result }: { result: BacktestResult }) {
    const t = useTranslations("backtest")
    const { equityCurve, benchmark } = result
    const valueSeries = valueSeriesOf(t, result, trendOf(fromDecimal(result.totalReturn) ?? 0))
    const drawdown = equityCurve.flatMap((p) => (p.drawdown == null ? [] : [{ date: p.date, drawdown: p.drawdown }]))
    const valuePoints = equityCurve.map((p) => ({
        date: p.date,
        value: p.value,
        compare: benchmark ? p.benchmarkValue : p.lumpSumValue,
    }))

    return (
        <Card>
            <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <ResultHeadline result={result} />
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        <ProfitLine result={result} />
                        <ChartLegend series={drawdown.length > 0 ? [...valueSeries, drawdownSeries(t)] : valueSeries} />
                    </div>
                </div>
                <ValueDrawdownCharts
                    value={{ data: valuePoints, series: valueSeries }}
                    drawdown={{ data: drawdown, series: [drawdownSeries(t)] }}
                />
            </CardContent>
        </Card>
    )
}
