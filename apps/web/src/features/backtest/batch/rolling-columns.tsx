import { useTranslations } from "next-intl"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { useFormatters } from "@/lib/format"
import type { RollingWindow } from "../types"

/** Colonnes du tableau des fenêtres glissantes : durée, pire, médiane, meilleure et part négative (rendements annualisés). */
export function useRollingColumns(): Column<RollingWindow>[] {
    const f = useFormatters()
    const t = useTranslations("backtest.batch.rolling")

    return [
        {
            header: t("window"),
            cell: (w) => <span className="text-body-medium">{t("years", { count: w.years })}</span>,
        },
        {
            header: <InfoHint entry="rollingWindow">{t("worst")}</InfoHint>,
            className: "text-right",
            cell: (w) => (
                <span className={w.worst < 0 ? "text-destructive" : undefined}>{f.formatPercent(w.worst)}</span>
            ),
        },
        { header: t("median"), className: "text-right", cell: (w) => f.formatPercent(w.median) },
        { header: t("best"), className: "text-right", cell: (w) => f.formatPercent(w.best) },
        {
            header: <InfoHint entry="negativeWindows">{t("negativeShare")}</InfoHint>,
            className: "text-right",
            cell: (w) => f.formatRate(w.negativeShare),
        },
    ]
}
