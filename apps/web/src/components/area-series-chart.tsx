"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LOCALE } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Un point daté ; une série absente ce jour-là (`null`, `undefined`) n'a pas de point et rien dans l'infobulle. */
// Index élargi à `string` : TypeScript impose que `date` respecte la signature d'index
export type ChartPoint = { date: string; [series: string]: number | string | null | undefined }

export type ChartSeries = {
    key: string // clé de la valeur dans chaque `ChartPoint`
    label: string // nom dans l'infobulle quand il y a plusieurs séries
    color: string // couleur CSS, ex. "var(--chart-1)" ou `trendColor(…)`
    fill?: boolean // aire remplie jusqu'à zéro (une seule série remplie, sinon elles se masquent)
    dashed?: boolean // trait en pointillés, plus fin (série de référence : benchmark)
}

/** Vert pour une hausse, rouge pour une baisse. */
export const trendColor = (positive: boolean) => (positive ? "var(--success)" : "var(--destructive)")

const formatNumberAxis = (v: number) => v.toLocaleString(LOCALE, { maximumFractionDigits: v < 10 ? 2 : 0 })

interface AreaSeriesChartProps {
    data: ChartPoint[]
    series: ChartSeries[]
    formatTick: (date: string) => string
    formatTooltipDate: (date: string) => string
    formatValue: (value: number) => string // valeurs de l'infobulle, ex. montant dans la devise
    formatAxis?: (value: number) => string // axe Y ; par défaut nombre sans unité
    hideXAxis?: boolean // graphique empilé au-dessus d'un autre qui porte l'axe des dates
    className?: string
}

/** Courbes datées sur un axe commun : une `Area` par série de `series`, infobulle formatée par `formatValue`. */
export function AreaSeriesChart({
    data,
    series,
    formatTick,
    formatTooltipDate,
    formatValue,
    formatAxis = formatNumberAxis,
    hideXAxis = false,
    className,
}: AreaSeriesChartProps) {
    const config = Object.fromEntries(
        series.map((s) => [s.key, { label: s.label, color: s.color }]),
    ) satisfies ChartConfig
    const labels = new Map(series.map((s) => [s.key, s.label]))

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
                    tickFormatter={formatTick}
                />
                <YAxis
                    width={64}
                    tickLine={false}
                    axisLine={false}
                    tickCount={5}
                    domain={["auto", "auto"]}
                    tickFormatter={formatAxis}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            hideIndicator
                            labelFormatter={(_, payload) =>
                                payload?.[0] ? formatTooltipDate(payload[0].payload.date) : ""
                            }
                            formatter={(value, name) =>
                                value == null ? null : (
                                    <span className="text-body-medium">
                                        {series.length > 1 && `${labels.get(String(name))} : `}
                                        {formatValue(Number(value))}
                                    </span>
                                )
                            }
                        />
                    }
                />
                {series.map((s) => (
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
                ))}
            </AreaChart>
        </ChartContainer>
    )
}
