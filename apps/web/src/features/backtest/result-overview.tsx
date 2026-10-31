"use client"

import Dash from "@/components/custom/Dash"
import { PriceAreaChart } from "@/components/chart"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatMediumDate, formatMonthTick, formatPrice, formatRate, formatRatio } from "@/lib/format"
import { BACKTEST_CURRENCY } from "./constants"
import type { BacktestResult } from "./types"
import { fromDecimal } from "./utils"

/**
 * Carte principale d'un résultat : valeur finale et rendement total, puis la courbe de valeur avec, sous elle et sur le même
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
    const drawdown = equityCurve.flatMap((p) => (p.drawdown == null ? [] : [{ date: p.date, price: p.drawdown }]))

    return (
        <Card className="gap-4">
            <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <span className="text-body-medium text-muted-foreground">Valeur finale</span>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-h1">
                            {finalValue == null ? <Dash /> : formatPrice(finalValue, BACKTEST_CURRENCY)}
                        </span>
                        {totalReturn != null && (
                            <Badge variant={positive ? "success" : "destructive"}>{formatRatio(totalReturn)}</Badge>
                        )}
                    </div>
                    {profit != null && invested != null && (
                        <p className="text-body text-muted-foreground">
                            Plus-value {formatPrice(profit, BACKTEST_CURRENCY)} sur {formatPrice(invested, BACKTEST_CURRENCY)} investis
                            {benchmark && ` · ${benchmark.symbol} sur la même période : ${formatRatio(benchmark.totalReturn)}`}
                        </p>
                    )}
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
