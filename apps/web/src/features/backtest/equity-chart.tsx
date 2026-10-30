"use client"

import { PriceAreaChart } from "@/components/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LOCALE } from "@/lib/format"
import { BACKTEST_CURRENCY } from "./constants"
import type { EquityPoint, LumpSumComparison } from "./types"

const formatTick = (date: string) =>
    new Intl.DateTimeFormat(LOCALE, { month: "short", year: "2-digit" }).format(new Date(date))

const formatTooltipDate = (date: string) =>
    new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(new Date(date))

// Vert si le backtest est en plus-value : en DCA la valeur monte aussi avec les versements
export function EquityChart({ data, positive, comparison }: { data: EquityPoint[]; positive: boolean; comparison?: LumpSumComparison | null }) {
    const compare = new Map(comparison?.equityCurve.map((p) => [p.date, p.value]))

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Courbe d’equity</CardTitle>
                <CardDescription className="text-small">
                    {comparison ? "Valeur du portefeuille, comparée au même total investi en une fois" : "Valeur du portefeuille"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PriceAreaChart
                    data={data.map((p) => ({ date: p.date, price: p.value, compare: compare.get(p.date) }))}
                    formatTick={formatTick}
                    formatTooltipDate={formatTooltipDate}
                    label="Valeur"
                    currency={BACKTEST_CURRENCY}
                    positive={positive}
                    compareLabel={comparison ? "Investissement unique" : undefined}
                />
            </CardContent>
        </Card>
    )
}
