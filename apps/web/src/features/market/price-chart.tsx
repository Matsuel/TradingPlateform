"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { PriceAreaChart } from "@/components/chart"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export function PriceChart({ symbol }: { symbol: string }) {
    const [period, setPeriod] = useState<Period>("1d")
    const { data, isPending, isError, error, refetch, isPlaceholderData } = useMarketDetails(symbol, period)
    const interval = periodOptions.find((p) => p.value === period)!.interval

    const status = (content: React.ReactNode) => (
        <div className="flex h-82.5 flex-col items-center justify-center gap-3 text-center">{content}</div>
    )

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Prix</CardTitle>
                <CardDescription className="text-small">
                    {symbol} · points toutes les {interval}
                </CardDescription>
                <CardAction>
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
                        <TabsList>
                            {periodOptions.map((p) => (
                                <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </CardAction>
            </CardHeader>

            <CardContent>
                {isPending ? (
                    status(<Loader2 className="size-6 animate-spin text-muted-foreground" />)
                ) : isError ? (
                    status(
                        <>
                            <p className="text-sm text-destructive">{error.message}</p>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
                        </>
                    )
                ) : data.length === 0 ? (
                    status(<p className="text-sm text-muted-foreground">Aucune donnée pour cette période.</p>)
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
