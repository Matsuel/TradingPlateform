"use client"

import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { InfoHint } from "@/components/info-hint"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFormatters } from "@/lib/format"
import type { BacktestResult } from "./types"

type Breakdown = NonNullable<BacktestResult["returnBreakdown"]>

// Une ligne : libellé, valeur et barre dont la longueur est proportionnelle à |valeur| (la plus grande ligne = piste pleine)
type Row = { key: string; label: ReactNode; ratio: number; points: boolean; color: string }

/**
 * Carte « Décomposition du rendement » (maquette 31) : du rendement du cours seul au rendement en EUR. Les composantes
 * (cours, dividendes, change) s'affichent en points de pourcentage, les totaux (devise locale, EUR) en pourcentage.
 * Sans change (`fx` null), les lignes « devise locale » et « change » sont omises : le local est l'euro.
 */
export function ReturnBreakdownCard({ breakdown, totalReturn }: { breakdown: Breakdown; totalReturn: number }) {
    const f = useFormatters()
    const t = useTranslations("backtest.dividends")
    const { price, dividends, local, fx } = breakdown

    const rows: Row[] = [
        {
            key: "price",
            label: <InfoHint entry="localPriceReturn">{t("breakdown.price")}</InfoHint>,
            ratio: price,
            points: true,
            color: "bg-chart-1",
        },
        {
            key: "dividends",
            label: <InfoHint entry="dividendContribution">{t("breakdown.dividends")}</InfoHint>,
            ratio: dividends,
            points: true,
            color: "bg-success",
        },
        ...(fx == null
            ? []
            : [
                  {
                      key: "local",
                      label: <InfoHint entry="localReturn">{t("breakdown.local")}</InfoHint>,
                      ratio: local,
                      points: false,
                      color: "bg-foreground",
                  },
                  {
                      key: "fx",
                      label: <InfoHint entry="fxContribution">{t("breakdown.fx")}</InfoHint>,
                      ratio: fx,
                      points: true,
                      color: "bg-chart-4",
                  },
              ]),
        {
            key: "total",
            label: <InfoHint entry="totalReturn">{t("breakdown.total")}</InfoHint>,
            ratio: totalReturn,
            points: false,
            color: "bg-foreground",
        },
    ]
    const scale = Math.max(...rows.map((row) => Math.abs(row.ratio)))

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("breakdown.title")}</CardTitle>
                <CardDescription>{t("breakdown.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {rows.map((row) => (
                    <div key={row.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-body">
                            <span className="text-body-medium">{row.label}</span>
                            <span className="text-small text-muted-foreground">
                                {row.points
                                    ? t("points", { value: f.formatChange(row.ratio * 100) })
                                    : f.formatRatio(row.ratio)}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                            <div
                                className={`h-full rounded-full ${row.color}`}
                                style={{ width: `${scale === 0 ? 0 : (Math.abs(row.ratio) / scale) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
                <p className="text-small text-muted-foreground">
                    {fx == null ? t("breakdown.noteEur") : t("breakdown.note")}
                </p>
            </CardContent>
        </Card>
    )
}
