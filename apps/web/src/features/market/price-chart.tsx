"use client"

import { useState } from "react"
import { PriceAreaChart } from "@/components/chart"
import { FilterTabs } from "@/components/filter-tabs"
import { InfoHint } from "@/components/info-hint"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LOCALE } from "@/lib/format"
import { cn } from "@/lib/utils"
import { MARKET_CURRENCY, periodOptions } from "./constants"
import { useMarketDetails } from "./hook"
import type { Period } from "./types"

const tickFormats: Record<Period, Intl.DateTimeFormatOptions> = {
    "1d": { hour: "2-digit", minute: "2-digit" },
    "1w": { weekday: "short", day: "numeric" },
    "1m": { day: "numeric", month: "short" },
    "1y": { month: "short", year: "2-digit" },
    max: { year: "numeric" },
}

const formatTick = (date: string, period: Period) =>
    new Intl.DateTimeFormat(LOCALE, tickFormats[period]).format(new Date(date))

const formatTooltipDate = (date: string, period: Period) =>
    new Intl.DateTimeFormat(LOCALE, {
        dateStyle: "medium",
        ...(period === "1d" || period === "1w" ? { timeStyle: "short" } : {}),
    }).format(new Date(date))

/** Carte « Prix » d'un symbole : onglets de période (1J à Max) et courbe ; garde la courbe précédente, atténuée, pendant un changement de période. */
export function PriceChart({ symbol }: { symbol: string }) {
    const [period, setPeriod] = useState<Period>("1d")
    const { data, isPending, isError, error, refetch, isPlaceholderData } = useMarketDetails(symbol, period)
    const interval = periodOptions.find((p) => p.value === period)!.interval

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">
                    <InfoHint entry="priceChart">Prix</InfoHint>
                </CardTitle>
                <CardDescription className="text-small">
                    {symbol} · points toutes les {interval}
                </CardDescription>
                <CardAction>
                    <FilterTabs value={period} onChange={setPeriod} options={periodOptions} />
                </CardAction>
            </CardHeader>

            <CardContent>
                {isPending ? (
                    <LoadingState className="h-82.5" />
                ) : isError ? (
                    <ErrorState message={error.message} onRetry={refetch} className="h-82.5" />
                ) : data.length === 0 ? (
                    <p className="flex h-82.5 items-center justify-center text-sm text-muted-foreground">
                        Aucune donnée pour cette période.
                    </p>
                ) : (
                    <PriceAreaChart
                        data={data}
                        formatTick={(d) => formatTick(d, period)}
                        formatTooltipDate={(d) => formatTooltipDate(d, period)}
                        currency={MARKET_CURRENCY}
                        className={cn("transition-opacity", isPlaceholderData && "opacity-50")}
                    />
                )}
            </CardContent>
        </Card>
    )
}
