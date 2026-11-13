"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { AreaSeriesChart } from "@/components/area-series-chart"
import { DataTable } from "@/components/data-table/data-table"
import { FilterTabs } from "@/components/filter-tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFormatters } from "@/lib/format"
import { SUMMARY_WINDOW_YEARS } from "../constants"
import type { RollingWindow } from "../types"
import { useRollingColumns } from "./rolling-columns"

/**
 * Carte « Fenêtres glissantes » (maquette 32) : tableau pire / médiane / meilleure / part négative des fenêtres de 1, 3 et
 * 5 ans, et, pour la durée choisie dans les onglets, la courbe du rendement annualisé selon la date d'entrée avec la pire
 * fenêtre marquée. `windows` : `rollingSummary` du lot (les durées plus longues que l'historique sont absentes).
 */
export function RollingWindows({ windows }: { windows: RollingWindow[] }) {
    const f = useFormatters()
    const t = useTranslations("backtest.batch.rolling")
    const columns = useRollingColumns()
    const [years, setYears] = useState(
        windows.some((w) => w.years === SUMMARY_WINDOW_YEARS) ? SUMMARY_WINDOW_YEARS : windows[0]!.years,
    )
    const selected = windows.find((w) => w.years === years) ?? windows[0]!

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <FilterTabs
                    value={String(years)}
                    onChange={(value) => setYears(Number(value))}
                    options={windows.map((w) => ({ value: String(w.years), label: t("years", { count: w.years }) }))}
                    className="justify-self-start"
                />
                <DataTable rows={windows} columns={columns} rowKey={(w) => String(w.years)} />
                <AreaSeriesChart
                    data={selected.points}
                    series={[{ key: "value", label: t("seriesLabel"), color: "var(--chart-1)" }]}
                    marker={{
                        date: selected.worstDate,
                        key: "value",
                        label: t("worstMarker", { value: f.formatPercent(selected.worst) }),
                    }}
                    zeroLine
                    dateFormat={{ tick: f.formatYear, tooltip: f.formatDay }}
                    valueFormat={{
                        tooltip: f.formatPercent,
                        axis: (value) => f.formatRatio(value).replace(/[,.]00/, ""),
                    }}
                    className="h-56"
                />
                <p className="text-small text-muted-foreground">{t("caption", { years: selected.years })}</p>
            </CardContent>
        </Card>
    )
}
