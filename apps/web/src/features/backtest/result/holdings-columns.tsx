import { useTranslations } from "next-intl"
import { SymbolCell } from "@/components/data-table/cells"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { useFormatters } from "@/lib/format"
import { BACKTEST_CURRENCY } from "../constants"
import type { Holding } from "../types"

export function useHoldingColumns(): Column<Holding>[] {
    const { formatPrice, formatQuantity } = useFormatters()
    const t = useTranslations("backtest")

    return [
        { header: t("columns.symbol"), cell: (h) => <SymbolCell symbol={h.symbol} /> },
        {
            header: <InfoHint entry="holdingQuantity">{t("columns.quantity")}</InfoHint>,
            className: "text-right",
            cell: (h) => formatQuantity(h.quantity),
        },
        {
            header: <InfoHint entry="holdingValue">{t("columns.value")}</InfoHint>,
            className: "text-right",
            cell: (h) => formatPrice(h.value, BACKTEST_CURRENCY),
        },
    ]
}
