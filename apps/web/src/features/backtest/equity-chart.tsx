"use client"

import { PriceAreaChart } from "@/components/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LOCALE } from "@/lib/format"
import { BACKTEST_CURRENCY } from "./constants"
import type { EquityPoint } from "./types"

const formatTick = (date: string) =>
    new Intl.DateTimeFormat(LOCALE, { month: "short", year: "2-digit" }).format(new Date(date))

const formatTooltipDate = (date: string) =>
    new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(new Date(date))

/**
 * Courbe de valeur du portefeuille. Si les points portent `lumpSumValue` (DCA), ajoute en pointillés
 * la courbe du même total investi en une fois. Vert si le backtest est en plus-value : en DCA la valeur
 * monte aussi avec les versements, la pente seule ne dit rien.
 */
export function EquityChart({ data, positive }: { data: EquityPoint[]; positive: boolean }) {
    const hasLumpSum = data.some((p) => p.lumpSumValue != null)

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Courbe d’equity</CardTitle>
                <CardDescription className="text-small">
                    {hasLumpSum ? "Valeur du portefeuille, comparée au même total investi en une fois" : "Valeur du portefeuille"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PriceAreaChart
                    data={data.map((p) => ({ date: p.date, price: p.value, compare: p.lumpSumValue }))}
                    formatTick={formatTick}
                    formatTooltipDate={formatTooltipDate}
                    label="Valeur"
                    currency={BACKTEST_CURRENCY}
                    positive={positive}
                    compareLabel={hasLumpSum ? "Investissement unique" : undefined}
                />
            </CardContent>
        </Card>
    )
}
