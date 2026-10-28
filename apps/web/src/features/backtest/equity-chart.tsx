"use client"

import { PriceAreaChart } from "@/components/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BACKTEST_CURRENCY } from "./constants"
import type { EquityPoint } from "./types"

const formatTick = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(new Date(date))

const formatTooltipDate = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date))

// Vert si le backtest est en plus-value : en DCA la valeur monte aussi avec les versements
export function EquityChart({ data, positive }: { data: EquityPoint[]; positive: boolean }) {
    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Courbe d’equity</CardTitle>
                <CardDescription className="text-small">Valeur du portefeuille</CardDescription>
            </CardHeader>
            <CardContent>
                <PriceAreaChart
                    data={data.map((p) => ({ date: p.date, price: p.value }))}
                    formatTick={formatTick}
                    formatTooltipDate={formatTooltipDate}
                    label="Valeur"
                    currency={BACKTEST_CURRENCY}
                    positive={positive}
                />
            </CardContent>
        </Card>
    )
}
