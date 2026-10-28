"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { formatPrice, LOCALE } from "@/lib/format"

const formatAxisPrice = (v: number) =>
    v.toLocaleString(LOCALE, { maximumFractionDigits: v < 10 ? 2 : 0 })

export type PricePoint = { date: string; price: number }

interface PriceAreaChartProps {
    data: PricePoint[]
    formatTick: (date: string) => string
    formatTooltipDate: (date: string) => string
    label?: string
    currency: string
    positive?: boolean // vert/rouge ; par défaut : dernier point ≥ premier
    className?: string
}

export function PriceAreaChart({
    data,
    formatTick,
    formatTooltipDate,
    label = "Prix",
    currency,
    positive = data.length < 2 || data[data.length - 1].price >= data[0].price,
    className,
}: PriceAreaChartProps) {
    const color = positive ? "#16a34a" : "var(--destructive)"
    const config = {
        price: { label, color },
    } satisfies ChartConfig

    return (
        <ChartContainer config={config} className={cn("aspect-auto h-82.5 w-full", className)}>
            <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={48}
                    tickFormatter={formatTick}
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
                                payload?.[0] ? formatTooltipDate(payload[0].payload.date) : ""
                            }
                            formatter={(value) => (
                                <span className="text-body-medium">{formatPrice(Number(value), currency)}</span>
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
    )
}
