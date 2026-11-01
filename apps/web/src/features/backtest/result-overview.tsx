"use client"

import Dash from "@/components/custom/Dash"
import { PriceAreaChart } from "@/components/chart"
import { InfoHint } from "@/components/info-hint"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { GlossaryKey } from "@/constants/glossary"
import { formatMediumDate, formatMonthTick, formatRate, formatRatio } from "@/lib/format"
import { cn } from "@/lib/utils"
import { BACKTEST_CURRENCY } from "./constants"
import type { BacktestResult } from "./types"
import { formatAmount, fromDecimal } from "./utils"

// Légende du graphique (maquette 15.1) : trait de la couleur de la série, libellé qui ouvre son aide
function LegendItem({ hint, swatch, children }: { hint: GlossaryKey; swatch: string; children: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span aria-hidden className={cn("w-3", swatch)} />
            <InfoHint entry={hint}>{children}</InfoHint>
        </span>
    )
}

/**
 * Carte principale d'un résultat : valeur finale et rendement total, légende des séries (libellés `InfoHint`), puis la courbe de valeur avec, sous elle et sur le même
 * axe des dates, la courbe de drawdown. La série en pointillés est le benchmark s'il existe, sinon l'investissement unique (DCA).
 * Drawdown masqué pour un résultat antérieur dont les points n'ont pas de `drawdown`.
 */
export function ResultOverview({ result }: { result: BacktestResult }) {
    const { equityCurve, benchmark } = result
    const finalValue = fromDecimal(result.finalValue)
    const totalReturn = fromDecimal(result.totalReturn)
    const profit = fromDecimal(result.profit)
    const invested = fromDecimal(result.totalInvested)
    const positive = (totalReturn ?? 0) >= 0
    const compareLabel = benchmark
        ? `Benchmark ${benchmark.symbol}`
        : equityCurve.some((p) => p.lumpSumValue != null) ? "Investissement unique" : undefined
    const finalValueText = finalValue == null ? undefined : formatAmount(finalValue)
    const benchmarkReturn = benchmark && formatRatio(benchmark.totalReturn)
    const drawdown = equityCurve.flatMap((p) => (p.drawdown == null ? [] : [{ date: p.date, price: p.drawdown }]))

    return (
        <Card className="gap-4">
            <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <span className="text-body-medium text-muted-foreground">
                        <InfoHint entry="finalValue" value={finalValueText}>Valeur finale</InfoHint>
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-h1">
                            {finalValueText ?? <Dash />}
                        </span>
                        {totalReturn != null && (
                            <Badge variant={positive ? "success" : "destructive"}>{formatRatio(totalReturn)}</Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        {profit != null && invested != null && (
                            <p className="text-body text-muted-foreground">
                                <InfoHint entry="profit" value={formatAmount(profit)}>Plus-value</InfoHint> {formatAmount(profit)} sur{" "}
                                <InfoHint entry="totalInvested" value={formatAmount(invested)}>{formatAmount(invested)} investis</InfoHint>
                                {benchmark && ` · ${benchmark.symbol} sur la même période : ${benchmarkReturn}`}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-small text-muted-foreground">
                            <LegendItem hint="equityCurve" swatch={cn("h-0.5", positive ? "bg-green-600" : "bg-destructive")}>Portefeuille</LegendItem>
                            {compareLabel && (
                                <LegendItem hint={benchmark ? "benchmark" : "lumpSum"} swatch="border-t-2 border-dashed border-muted-foreground">
                                    {compareLabel}
                                </LegendItem>
                            )}
                            {drawdown.length > 0 && <LegendItem hint="drawdownCurve" swatch="h-0.5 bg-destructive">Drawdown</LegendItem>}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <PriceAreaChart
                        data={equityCurve.map((p) => ({ date: p.date, price: p.value, compare: benchmark ? p.benchmarkValue : p.lumpSumValue }))}
                        formatTick={formatMonthTick}
                        formatTooltipDate={formatMediumDate}
                        label="Portefeuille"
                        currency={BACKTEST_CURRENCY}
                        positive={positive}
                        compareLabel={compareLabel}
                        hideXAxis={drawdown.length > 0}
                        className="h-56"
                    />
                    {drawdown.length > 0 && (
                        <>
                            <span className="text-small font-medium text-muted-foreground">Drawdown</span>
                            <PriceAreaChart
                                data={drawdown}
                                formatTick={formatMonthTick}
                                formatTooltipDate={formatMediumDate}
                                formatAxis={formatRate}
                                formatValue={formatRatio}
                                label="Drawdown"
                                positive={false}
                                className="h-24"
                            />
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
