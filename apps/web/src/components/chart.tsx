"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { formatPrice, LOCALE } from "@/lib/format"

const formatAxisPrice = (v: number) =>
    v.toLocaleString(LOCALE, { maximumFractionDigits: v < 10 ? 2 : 0 })

// compare : série de référence optionnelle, tracée en pointillés quand compareLabel est fourni ;
// other : seconde série pleine, tracée quand otherLabel est fourni ; price null : pas de point à cette date (périodes différentes)
export type PricePoint = { date: string; price: number | null; compare?: number; other?: number }

// Valeurs de l'infobulle : montant dans la devise, ou formatter libre (ex. ratio en pourcentage)
type ValueFormat =
    | { currency: string; formatValue?: undefined }
    | { formatValue: (value: number) => string; currency?: undefined }

type PriceAreaChartProps = ValueFormat & {
    data: PricePoint[]
    formatTick: (date: string) => string
    formatTooltipDate: (date: string) => string
    formatAxis?: (value: number) => string // axe Y ; par défaut nombre sans devise
    label?: string
    positive?: boolean // vert/rouge ; par défaut : dernier point ≥ premier
    color?: string // couleur de la série price, remplace vert/rouge (ex. "var(--chart-1)")
    compareLabel?: string // nom de la série compare ; absent = pas de courbe en pointillés
    otherLabel?: string // nom de la série other ; absent = pas de seconde courbe pleine
    otherColor?: string
    hideXAxis?: boolean // graphique empilé au-dessus d'un autre qui porte l'axe des dates
    className?: string
}

/**
 * Courbe d'aire d'une série de prix ou de valeurs, verte ou rouge selon `positive`, remplie jusqu'à zéro
 * pour une série négative (ex. drawdown). Avec `compareLabel`, trace aussi la série `compare` des points
 * en pointillés gris (ex. investissement unique). Avec `otherLabel`, trace la série `other` en seconde courbe pleine
 * (ex. backtest B), les deux séries sans remplissage. `formatValue` remplace le format monétaire de l'infobulle.
 */
export function PriceAreaChart({
    data,
    formatTick,
    formatTooltipDate,
    formatAxis = formatAxisPrice,
    label = "Prix",
    currency,
    formatValue,
    positive = data.length < 2 || (data[data.length - 1].price ?? 0) >= (data[0].price ?? 0),
    color = positive ? "#16a34a" : "var(--destructive)",
    compareLabel,
    otherLabel,
    otherColor = "var(--chart-2)",
    hideXAxis = false,
    className,
}: PriceAreaChartProps) {
    const format = formatValue ?? ((v: number) => formatPrice(v, currency))
    const config = {
        price: { label, color },
        compare: { label: compareLabel, color: "var(--muted-foreground)" },
        other: { label: otherLabel, color: otherColor },
    } satisfies ChartConfig
    const names: Record<string, string | undefined> = { price: label, compare: compareLabel, other: otherLabel }

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
                    orientation="left"
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
                            // Point absent d'une série (price null) : rien dans l'infobulle plutôt que 0
                            formatter={(value, name) => value == null ? null : (
                                <span className="text-body-medium">
                                    {(compareLabel || otherLabel) && `${names[String(name)]} : `}
                                    {format(Number(value))}
                                </span>
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
                    // Deux aires pleines superposées se masqueraient : sans remplissage avec une seconde série
                    fillOpacity={otherLabel ? 0 : 0.12}
                    dot={false}
                    isAnimationActive={false}
                />
                {otherLabel && (
                    <Area
                        dataKey="other"
                        type="monotone"
                        stroke="var(--color-other)"
                        strokeWidth={2}
                        fill="none"
                        dot={false}
                        isAnimationActive={false}
                    />
                )}
                {compareLabel && (
                    <Area
                        dataKey="compare"
                        type="monotone"
                        stroke="var(--color-compare)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fill="none"
                        dot={false}
                        isAnimationActive={false}
                    />
                )}
            </AreaChart>
        </ChartContainer>
    )
}
