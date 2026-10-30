"use client"

import { PriceAreaChart } from "@/components/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMediumDate, formatMonthTick, formatRate, formatRatio } from "@/lib/format"
import type { EquityPoint } from "./types"

/**
 * Courbe de drawdown : baisse depuis le plus haut (ratio ≤ 0, TWR calculé par le moteur), en aire rouge sous zéro,
 * sur le même axe temporel que `EquityChart`. Rien n'est rendu si les points n'ont pas de `drawdown` (résultat antérieur).
 */
export function DrawdownChart({ data }: { data: EquityPoint[] }) {
    const points = data.flatMap((p) => (p.drawdown == null ? [] : [{ date: p.date, price: p.drawdown }]))

    if (points.length === 0) return null

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Drawdown</CardTitle>
                <CardDescription className="text-small">
                    Baisse depuis le plus haut, hors effet des versements
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PriceAreaChart
                    data={points}
                    formatTick={formatMonthTick}
                    formatTooltipDate={formatMediumDate}
                    formatAxis={formatRate}
                    formatValue={formatRatio}
                    label="Drawdown"
                    positive={false}
                    className="h-48"
                />
            </CardContent>
        </Card>
    )
}
