"use client"

import { type ChartSeries, trendColor } from "@/components/area-series-chart"
import { Dash } from "@/components/dash"
import { InfoHint } from "@/components/info-hint"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { GlossaryKey } from "@/constants/glossary"
import { formatRatio } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { BacktestResult } from "./types"
import { formatAmount, fromDecimal } from "./utils"
import { ValueDrawdownCharts } from "./value-drawdown-charts"

// Légende du graphique (maquette 15.1) : trait de la couleur de la série, libellé qui ouvre son aide
function LegendItem({ hint, swatch, children }: { hint: GlossaryKey; swatch: string; children: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span aria-hidden className={cn("w-3", swatch)} />
            <InfoHint entry={hint}>{children}</InfoHint>
        </span>
    )
}

// Valeur finale et rendement total
function ResultHeadline({ result }: { result: BacktestResult }) {
    const finalValue = fromDecimal(result.finalValue)
    const totalReturn = fromDecimal(result.totalReturn)
    const finalValueText = finalValue == null ? undefined : formatAmount(finalValue)

    return (
        <>
            <span className="text-body-medium text-muted-foreground">
                <InfoHint entry="finalValue" value={finalValueText}>
                    Valeur finale
                </InfoHint>
            </span>
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-h1">{finalValueText ?? <Dash />}</span>
                {totalReturn != null && (
                    <Badge variant={totalReturn >= 0 ? "success" : "destructive"}>{formatRatio(totalReturn)}</Badge>
                )}
            </div>
        </>
    )
}

// Plus-value sur le montant investi et, avec un benchmark, son rendement ; rien pour un résultat antérieur
function ProfitLine({ result }: { result: BacktestResult }) {
    const { benchmark } = result
    const profit = fromDecimal(result.profit)
    const invested = fromDecimal(result.totalInvested)
    if (profit == null || invested == null) return null

    return (
        <p className="text-body text-muted-foreground">
            <InfoHint entry="profit" value={formatAmount(profit)}>
                Plus-value
            </InfoHint>{" "}
            {formatAmount(profit)} sur{" "}
            <InfoHint entry="totalInvested" value={formatAmount(invested)}>
                {formatAmount(invested)} investis
            </InfoHint>
            {benchmark && ` · ${benchmark.symbol} sur la même période : ${formatRatio(benchmark.totalReturn)}`}
        </p>
    )
}

/**
 * Carte principale d'un résultat : `ResultHeadline`, `ProfitLine` et légende des séries (libellés `InfoHint`), puis la courbe de valeur
 * et, dessous, la courbe de drawdown. La série en pointillés est le benchmark s'il existe, sinon l'investissement
 * unique (DCA). Drawdown masqué pour un résultat antérieur dont les points n'ont pas de `drawdown`.
 */
export function ResultOverview({ result }: { result: BacktestResult }) {
    const { equityCurve, benchmark } = result
    const positive = (fromDecimal(result.totalReturn) ?? 0) >= 0
    const hasLumpSum = equityCurve.some((p) => p.lumpSumValue != null)
    const compareLabel = benchmark ? `Benchmark ${benchmark.symbol}` : hasLumpSum ? "Investissement unique" : undefined
    const drawdown = equityCurve.flatMap((p) => (p.drawdown == null ? [] : [{ date: p.date, drawdown: p.drawdown }]))
    const valueSeries: ChartSeries[] = [
        { key: "value", label: "Portefeuille", color: trendColor(positive), fill: true },
        ...(compareLabel
            ? [{ key: "compare", label: compareLabel, color: "var(--muted-foreground)", dashed: true }]
            : []),
    ]

    return (
        <Card className="gap-4">
            <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <ResultHeadline result={result} />
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        <ProfitLine result={result} />
                        <div className="flex flex-wrap items-center gap-4 text-small text-muted-foreground">
                            <LegendItem
                                hint="equityCurve"
                                swatch={cn("h-0.5", positive ? "bg-success" : "bg-destructive")}
                            >
                                Portefeuille
                            </LegendItem>
                            {compareLabel && (
                                <LegendItem
                                    hint={benchmark ? "benchmark" : "lumpSum"}
                                    swatch="border-t-2 border-dashed border-muted-foreground"
                                >
                                    {compareLabel}
                                </LegendItem>
                            )}
                            {drawdown.length > 0 && (
                                <LegendItem hint="drawdownCurve" swatch="h-0.5 bg-destructive">
                                    Drawdown
                                </LegendItem>
                            )}
                        </div>
                    </div>
                </div>
                <ValueDrawdownCharts
                    value={{
                        data: equityCurve.map((p) => ({
                            date: p.date,
                            value: p.value,
                            compare: benchmark ? p.benchmarkValue : p.lumpSumValue,
                        })),
                        series: valueSeries,
                    }}
                    drawdown={{
                        data: drawdown,
                        series: [{ key: "drawdown", label: "Drawdown", color: "var(--destructive)", fill: true }],
                    }}
                />
            </CardContent>
        </Card>
    )
}
