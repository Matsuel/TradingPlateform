"use client"
import { Line, LineChart, YAxis } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { MarketDetails } from "@/features/market/types"

const config = { value: { label: "Prix" } } satisfies ChartConfig

type SparklineProps = {
    data: MarketDetails[]
    positive: boolean
    className?: string
}

export function Sparkline({
    data,
    positive,
    className
}: SparklineProps) {
    
    const color = positive ? "#16a34a" : "var(--destructive)"

    return (
        <ChartContainer config={config} className={className ?? "h-8 w-30"}>
            <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    
                />
            </LineChart>
        </ChartContainer>
    )
}