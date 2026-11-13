import { useTranslations } from "next-intl"
import { Dash } from "@/components/dash"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { Badge } from "@/components/ui/badge"
import { useFormatters } from "@/lib/format"
import { StatusBadge } from "../status-badge"
import type { BacktestBatch } from "../types"
import { formatAmount, fromDecimal, yearsBetween } from "../utils"

/**
 * Colonnes du tableau d'un lot (maquette 32) : départ, durée jusqu'à `endDate` (fin commune), CAGR, volatilité, drawdown max,
 * valeur finale, puis statut remplacé par « Meilleur » ou « Pire » une fois le lot terminé. Tirets sans résultat.
 */
export function useBatchColumns(endDate: string): Column<BacktestBatch["rows"][number]>[] {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const ratio = (value: string | null | undefined) => {
        const n = fromDecimal(value)
        return n == null ? <Dash /> : f.formatPercent(n)
    }

    return [
        {
            header: t("batch.columns.start"),
            cell: (row) => <span className="text-body-medium">{f.formatDay(row.startDate)}</span>,
        },
        { header: t("batch.columns.duration"), cell: (row) => f.formatYears(yearsBetween(row.startDate, endDate)) },
        {
            header: <InfoHint entry="cagr">{t("columns.cagr")}</InfoHint>,
            className: "text-right",
            cell: (row) => <span className={row.rank ? "font-medium" : undefined}>{ratio(row.result?.cagr)}</span>,
        },
        {
            header: <InfoHint entry="volatility">{t("batch.columns.volatility")}</InfoHint>,
            className: "text-right",
            cell: (row) => ratio(row.result?.volatility),
        },
        {
            header: <InfoHint entry="maxDrawdown">{t("batch.columns.maxDrawdown")}</InfoHint>,
            className: "text-right",
            cell: (row) => {
                const value = fromDecimal(row.result?.maxDrawdown)
                return value == null ? <Dash /> : <span className="text-destructive">{f.formatPercent(value)}</span>
            },
        },
        {
            header: <InfoHint entry="finalValue">{t("batch.columns.finalValue")}</InfoHint>,
            className: "text-right",
            cell: (row) => {
                const value = fromDecimal(row.result?.finalValue)
                return value == null ? <Dash /> : formatAmount(f, value)
            },
        },
        {
            header: t("batch.columns.status"),
            className: "text-right",
            cell: (row) =>
                row.rank ? (
                    <Badge variant={row.rank === "WORST" ? "destructive" : "outline"}>
                        {t(`batch.rank.${row.rank}`)}
                    </Badge>
                ) : (
                    <StatusBadge status={row.status} />
                ),
        },
    ]
}
