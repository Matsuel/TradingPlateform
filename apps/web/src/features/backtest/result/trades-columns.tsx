import { useTranslations } from "next-intl"
import { Dash } from "@/components/dash"
import { SymbolCell } from "@/components/data-table/cells"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { Badge } from "@/components/ui/badge"
import { useFormatters } from "@/lib/format"
import { BACKTEST_CURRENCY, tradeSideVariants } from "../constants"
import type { Trade } from "../types"

export function useTradeColumns(): Column<Trade>[] {
    const { formatDay, formatPrice, formatQuantity, formatSharpe } = useFormatters()
    const t = useTranslations("backtest")

    return [
        { header: t("columns.date"), cell: (trade) => formatDay(trade.date) },
        { header: t("columns.symbol"), cell: (trade) => <SymbolCell symbol={trade.symbol} /> },
        {
            header: <InfoHint entry="tradeSide">{t("columns.side")}</InfoHint>,
            cell: (trade) => {
                // Résultats antérieurs au rebalancement : uniquement des achats, sans side (D10)
                const side = trade.side ?? "BUY"
                return <Badge variant={tradeSideVariants[side]}>{t(`tradeSide.${side}`)}</Badge>
            },
        },
        {
            header: <InfoHint entry="tradePrice">{t("columns.price")}</InfoHint>,
            className: "text-right",
            // Cours de l'ordre sans devise, 2 décimales comme le Sharpe : « 268,50 »
            cell: (trade) => formatSharpe(trade.price),
        },
        {
            header: <InfoHint entry="tradeQuantity">{t("columns.quantity")}</InfoHint>,
            className: "text-right",
            cell: (trade) => (trade.quantity == null ? <Dash /> : formatQuantity(trade.quantity)),
        },
        {
            header: <InfoHint entry="tradeAmount">{t("columns.amount")}</InfoHint>,
            className: "text-right",
            cell: (trade) => (trade.amount == null ? <Dash /> : formatPrice(trade.amount, BACKTEST_CURRENCY)),
        },
        {
            header: <InfoHint entry="tradeFee">{t("columns.fees")}</InfoHint>,
            className: "text-right",
            cell: (trade) => (trade.fee == null ? <Dash /> : formatPrice(trade.fee, BACKTEST_CURRENCY)),
        },
    ]
}
