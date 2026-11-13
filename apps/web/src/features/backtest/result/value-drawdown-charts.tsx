"use client"

import { useTranslations } from "next-intl"
import { AreaSeriesChart, type ChartPoint, type ChartSeries } from "@/components/area-series-chart"
import { useFormatters } from "@/lib/format"
import { formatAmount } from "../utils"

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
    const t = useTranslations("backtest.overview")
    const { formatMediumDate, formatMonthTick, formatRate, formatRatio } = f
    const dateFormat = { tick: formatMonthTick, tooltip: formatMediumDate }
    const hasDrawdown = drawdown.data.length > 0

    return (
        <div className="flex flex-col gap-2">
            <AreaSeriesChart
                {...value}
                dateFormat={dateFormat}
                valueFormat={{ tooltip: (v) => formatAmount(f, v) }}
                hideXAxis={hasDrawdown}
                className="h-56"
            />
            {hasDrawdown && (
                <>
                    <span className="text-small font-medium text-muted-foreground">{t("drawdown")}</span>
                    <AreaSeriesChart
                        {...drawdown}
                        dateFormat={dateFormat}
                        valueFormat={{ tooltip: formatRatio, axis: formatRate }}
                        className="h-24"
                    />
                </>
            )}
        </div>
    )
}
