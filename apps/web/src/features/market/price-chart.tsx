"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { AreaSeriesChart } from "@/components/area-series-chart"
import { FilterTabs } from "@/components/filter-tabs"
import { InfoHint } from "@/components/info-hint"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApiErrorMessages } from "@/lib/api-error"
import { useFormatters } from "@/lib/format"
import { trendOf, trendStyles } from "@/lib/trend"
import { cn } from "@/lib/utils"
import { MARKET_CURRENCY, periods } from "./constants"
import { useMarketDetails } from "./hook"
import type { Period } from "./types"

const tickFormats: Record<Period, Intl.DateTimeFormatOptions> = {
    "1d": { hour: "2-digit", minute: "2-digit" },
    "1w": { weekday: "short", day: "numeric" },
    "1m": { day: "numeric", month: "short" },
    "1y": { month: "short", year: "2-digit" },
    max: { year: "numeric" },
}

const formatTick = (locale: string, date: string, period: Period) =>
    new Intl.DateTimeFormat(locale, tickFormats[period]).format(new Date(date))

const formatTooltipDate = (locale: string, date: string, period: Period) =>
    new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        ...(period === "1d" || period === "1w" ? { timeStyle: "short" } : {}),
    }).format(new Date(date))

/** Carte « Prix » d'un symbole : onglets de période (1J à Max) et courbe ; garde la courbe précédente, atténuée, pendant un changement de période. */
// Tendance de la période : dernier cours face au premier
const trendOfPeriod = (points: { price: number }[]) =>
    points.length < 2 ? "neutral" : trendOf(points[points.length - 1].price - points[0].price)

export function PriceChart({ symbol }: { symbol: string }) {
    const { formatPrice, locale } = useFormatters()
    const t = useTranslations("market")
    const { errorMessage } = useApiErrorMessages()
    const [period, setPeriod] = useState<Period>("1d")
    const { data, isPending, isError, error, refetch, isPlaceholderData } = useMarketDetails(symbol, period)
    const periodOptions = periods.map((value) => ({ value, label: t(`periods.${value}`) }))

    return (
        <Card size="compact">
            <CardHeader>
                <CardTitle>
                    <InfoHint entry="priceChart">{t("chart.title")}</InfoHint>
                </CardTitle>
                <CardDescription>
                    {t("chart.description", { symbol, interval: t(`intervals.${period}`) })}
                </CardDescription>
                <CardAction>
                    <FilterTabs value={period} onChange={setPeriod} options={periodOptions} />
                </CardAction>
            </CardHeader>

            <CardContent>
                {isPending ? (
                    <LoadingState className="h-82.5" />
                ) : isError ? (
                    <ErrorState message={errorMessage(error)} onRetry={refetch} className="h-82.5" />
                ) : data.length === 0 ? (
                    <p className="flex h-82.5 items-center justify-center text-body text-muted-foreground">
                        {t("chart.empty")}
                    </p>
                ) : (
                    <AreaSeriesChart
                        data={data}
                        series={[
                            {
                                key: "price",
                                label: t("chart.title"),
                                color: trendStyles[trendOfPeriod(data)].color,
                                fill: true,
                            },
                        ]}
                        dateFormat={{
                            tick: (d) => formatTick(locale, d, period),
                            tooltip: (d) => formatTooltipDate(locale, d, period),
                        }}
                        valueFormat={{ tooltip: (v) => formatPrice(v, MARKET_CURRENCY) }}
                        className={cn("transition-opacity", isPlaceholderData && "opacity-50")}
                    />
                )}
            </CardContent>
        </Card>
    )
}
