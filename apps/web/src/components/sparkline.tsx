"use client"

import { Line, LineChart, YAxis } from "recharts"
import { type ChartPoint, trendColor } from "@/components/area-series-chart"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"

const config = { price: { label: "Prix" } } satisfies ChartConfig

type SparklineProps = {
    data: ChartPoint[] // série `price`
    positive: boolean
    className?: string
}

/** Mini-courbe de `price` sans axes, verte ou rouge selon `positive` (colonne « Tendance » du marché). */
export function Sparkline({ data, positive, className }: SparklineProps) {
    return (
        <ChartContainer config={config} className={className ?? "h-8 w-30"}>
            <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={trendColor(positive)}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ChartContainer>
    )
}
