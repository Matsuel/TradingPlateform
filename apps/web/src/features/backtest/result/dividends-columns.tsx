import { useTranslations } from "next-intl"
import { SymbolCell } from "@/components/data-table/cells"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { useFormatters } from "@/lib/format"
import { BACKTEST_CURRENCY } from "../constants"
import type { DividendEvent } from "../types"

export function useDividendColumns(): Column<DividendEvent>[] {
    const { formatDay, formatPrice, formatQuantity } = useFormatters()
    const t = useTranslations("backtest.dividends.table")

    return [
        { header: t("exDate"), cell: (event) => formatDay(event.date) },
        { header: t("symbol"), cell: (event) => <SymbolCell symbol={event.symbol} /> },
        {
            header: <InfoHint entry="dividendAmount">{t("amount")}</InfoHint>,
            className: "text-right",
            cell: (event) => formatPrice(event.amount, BACKTEST_CURRENCY),
        },
        {
            header: <InfoHint entry="dividendQuantity">{t("quantity")}</InfoHint>,
            className: "text-right",
            cell: (event) => formatQuantity(event.quantity),
        },
    ]
}
