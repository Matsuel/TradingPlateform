"use client"

import { AreaSeriesChart, type ChartPoint, type ChartSeries } from "@/components/area-series-chart"
import { useFormatters } from "@/lib/format"
import { formatAmount } from "./utils"

interface ValueDrawdownChartsProps {
    value: { data: ChartPoint[]; series: ChartSeries[] } // montants en `BACKTEST_CURRENCY`
    drawdown: { data: ChartPoint[]; series: ChartSeries[] } // ratios ≤ 0 ; `data` vide : graphique masqué
}

/**
 * Courbe de valeur d'un ou deux portefeuilles puis, dessous et sur le même axe des dates, leur drawdown.
 * Sans point de drawdown (résultat antérieur à son calcul), seule la courbe de valeur s'affiche, avec son axe.
 */
export function ValueDrawdownCharts({ value, drawdown }: ValueDrawdownChartsProps) {
    const f = useFormatters()
    const { formatMediumDate, formatMonthTick, formatRate, formatRatio } = f
    const hasDrawdown = drawdown.data.length > 0

    return (
        <div className="flex flex-col gap-2">
            <AreaSeriesChart
                {...value}
                formatTick={formatMonthTick}
                formatTooltipDate={formatMediumDate}
                formatValue={(v) => formatAmount(f, v)}
                hideXAxis={hasDrawdown}
                className="h-56"
            />
            {hasDrawdown && (
                <>
                    <span className="text-small font-medium text-muted-foreground">Drawdown</span>
                    <AreaSeriesChart
                        {...drawdown}
                        formatTick={formatMonthTick}
                        formatTooltipDate={formatMediumDate}
                        formatAxis={formatRate}
                        formatValue={formatRatio}
                        className="h-24"
                    />
                </>
            )}
        </div>
    )
}
