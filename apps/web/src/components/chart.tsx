"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import { Period } from "@/features/market/api"
import { useMarketDetails } from "@/features/market/hook"

const PERIODS: { value: Period; label: string; interval: string }[] = [
    { value: "1d", label: "1J", interval: "5 min" },
    { value: "1w", label: "1S", interval: "1 h" },
    { value: "1m", label: "1M", interval: "1 jour" },
    { value: "1y", label: "1A", interval: "1 semaine" },
    { value: "max", label: "Max", interval: "1 mois" },
]

const tickFormats: Record<Period, Intl.DateTimeFormatOptions> = {
    "1d": { hour: "2-digit", minute: "2-digit" },
    "1w": { weekday: "short", day: "numeric" },
    "1m": { day: "numeric", month: "short" },
    "1y": { month: "short", year: "2-digit" },
    max: { year: "numeric" },
}

const formatTick = (date: string, period: Period) =>
    new Intl.DateTimeFormat("fr-FR", tickFormats[period]).format(new Date(date))

const formatTooltipDate = (date: string, period: Period) =>
    new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        ...(period === "1d" || period === "1w" ? { timeStyle: "short" } : {}),
    }).format(new Date(date))

const formatAxisPrice = (v: number) =>
    v.toLocaleString("fr-FR", { maximumFractionDigits: v < 10 ? 2 : 0 })

export function PriceChart({ symbol }: { symbol: string }) {
    const [period, setPeriod] = useState<Period>("1d")
    const { data, isPending, isError, error, refetch, isPlaceholderData } = useMarketDetails(symbol, period)
    const positive = data && data.length > 1
        ? data[data.length - 1].price >= data[0].price
        : true
    const color = positive ? "#16a34a" : "var(--destructive)"
    const config = {
        price: { label: "Prix", color },
    } satisfies ChartConfig

    const interval = PERIODS.find((p) => p.value === period)!.interval

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
                            {PERIODS.map((p) => (
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
                    <ChartContainer
                        config={config}
                        className={cn("aspect-auto h-82.5 w-full transition-opacity", isPlaceholderData && "opacity-50")}
                    >
                        <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={48}
                                tickFormatter={(d) => formatTick(d, period)}
                            />
                            <YAxis
                                orientation="left"
                                width={64}
                                tickLine={false}
                                axisLine={false}
                                tickCount={5}
                                domain={["auto", "auto"]}
                                tickFormatter={formatAxisPrice}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        hideIndicator
                                        labelFormatter={(_, payload) =>
                                            payload?.[0] ? formatTooltipDate(payload[0].payload.date, period) : ""
                                        }
                                        formatter={(value) => (
                                            <span className="text-body-medium">{formatPrice(Number(value))}</span>
                                        )}
                                    />
                                }
                            />
                            <Area
                                dataKey="price"
                                type="monotone"
                                stroke="var(--color-price)"
                                strokeWidth={2}
                                fill="var(--color-price)"
                                fillOpacity={0.12}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}