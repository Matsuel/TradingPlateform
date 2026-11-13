"use client"

import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useFormatters } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ChartDateFormat, ChartMarker, ChartPoint, ChartSeries, ChartValueFormat } from "./area-series-types"

export {
    type ChartDateFormat,
    type ChartMarker,
    type ChartPoint,
    type ChartSeries,
    type ChartValueFormat,
    referenceSeries,
} from "./area-series-types"

interface AreaSeriesChartProps {
    data: ChartPoint[]
    series: ChartSeries[]
    dateFormat: ChartDateFormat
    valueFormat: ChartValueFormat
    marker?: ChartMarker
    zeroLine?: boolean // trait plein à 0 (séries qui passent sous zéro : rendements)
    hideXAxis?: boolean // graphique empilé au-dessus d'un autre qui porte l'axe des dates
    className?: string
}

// Infobulle : la date, puis la valeur de chaque série présente ce jour-là, préfixée de son nom s'il y en a plusieurs
type Formats = Pick<AreaSeriesChartProps, "dateFormat" | "valueFormat">

function tooltipContent(series: ChartSeries[], { dateFormat, valueFormat }: Formats) {
    const labels = new Map(series.map((s) => [s.key, s.label]))
    return (
        <ChartTooltipContent
            hideIndicator
            labelFormatter={(_, payload) => (payload?.[0] ? dateFormat.tooltip(payload[0].payload.date) : "")}
            formatter={(value, name) =>
                value == null ? null : (
                    <span className="text-body-medium">
                        {series.length > 1 && `${labels.get(String(name))} : `}
                        {valueFormat.tooltip(Number(value))}
                    </span>
                )
            }
        />
    )
}

// Une courbe : trait seul, ou aire remplie jusqu'à zéro pour `fill`
function seriesArea(s: ChartSeries) {
    return (
        <Area
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={s.dashed ? 1.5 : 2}
            strokeDasharray={s.dashed ? "4 4" : undefined}
            fill={s.fill ? `var(--color-${s.key})` : "none"}
            fillOpacity={s.fill ? 0.12 : 0}
            dot={false}
            isAnimationActive={false}
        />
    )
}

function markerDot(marker: ChartMarker, data: ChartPoint[]) {
    return (
        <ReferenceDot
            x={marker.date}
            y={data.find((point) => point.date === marker.date)?.[marker.key] as number | undefined}
            r={4}
            fill="var(--destructive)"
            stroke="none"
            label={{ value: marker.label, position: "top", fill: "var(--foreground)", fontSize: 12 }}
        />
    )
}

/** Courbes datées sur un axe commun : une `Area` par série de `series`, infobulle formatée par `valueFormat.tooltip`. */
export function AreaSeriesChart({
    data,
    series,
    dateFormat,
    valueFormat,
    marker,
    zeroLine = false,
    hideXAxis = false,
    className,
}: AreaSeriesChartProps) {
    const { formatAxis } = useFormatters()
    const config = Object.fromEntries(
        series.map((s) => [s.key, { label: s.label, color: s.color }]),
    ) satisfies ChartConfig

    return (
        <ChartContainer config={config} className={cn("aspect-auto h-82.5 w-full", className)}>
            <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    hide={hideXAxis}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={48}
                    tickFormatter={dateFormat.tick}
                />
                <YAxis
                    width={64}
                    tickLine={false}
                    axisLine={false}
                    tickCount={5}
                    domain={["auto", "auto"]}
                    tickFormatter={valueFormat.axis ?? formatAxis}
                />
                <ChartTooltip cursor={false} content={tooltipContent(series, { dateFormat, valueFormat })} />
                {zeroLine && <ReferenceLine y={0} stroke="var(--border)" />}
                {series.map(seriesArea)}
                {marker && markerDot(marker, data)}
            </AreaChart>
        </ChartContainer>
    )
}
