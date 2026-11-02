"use client"

import { Line, LineChart, YAxis } from "recharts"
import type { ChartPoint } from "@/components/area-series-chart"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import { type Trend, trendStyles } from "@/lib/trend"

const config = { price: { label: "Prix" } } satisfies ChartConfig

type SparklineProps = {
    data: ChartPoint[] // série `price`
    trend: Trend
    className?: string
}

/** Mini-courbe de `price` sans axes, colorée selon `trend` (colonne « Tendance » du marché). */
export function Sparkline({ data, trend, className }: SparklineProps) {
    return (
        <ChartContainer config={config} className={className ?? "h-8 w-30"}>
            <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={trendStyles[trend].color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ChartContainer>
    )
}
