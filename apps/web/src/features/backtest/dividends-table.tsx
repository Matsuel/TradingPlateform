"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { TableCard } from "@/components/data-table/table-card"
import { InfoHint } from "@/components/info-hint"
import { PAGE_SIZE } from "@/constants/pagination"
import { useFormatters } from "@/lib/format"
import { paginate } from "@/lib/pagination"
import { useDividendColumns } from "./column"
import type { DividendEvent } from "./types"
import { formatAmount, fromDecimal } from "./utils"

/**
 * Table « Dividendes perçus » (maquette 31) : tous les versements, du plus récent au plus ancien, paginés côté client,
 * puis le total de la période. `events` : versements du moteur, du plus ancien au plus récent.
 */
export function DividendsTable({ events, total }: { events: DividendEvent[]; total: string | null }) {
    const f = useFormatters()
    const t = useTranslations("backtest.dividends.table")
    const columns = useDividendColumns()
    const [page, setPage] = useState(1)
    const totalAmount = fromDecimal(total)

    return (
        <TableCard title={t("title")} description={t("description")}>
            <DataTable
                rows={paginate(events.toReversed(), page, PAGE_SIZE)}
                columns={columns}
                rowKey={(event) => `${event.date}-${event.symbol}`}
                emptyMessage={t("empty")}
                pagination={{ page, pageSize: PAGE_SIZE, count: events.length, onPageChange: setPage }}
            />
            {totalAmount != null && (
                <p className="text-small text-muted-foreground">
                    <InfoHint entry="dividendTotal">
                        {t("total", { total: formatAmount(f, totalAmount), count: events.length })}
                    </InfoHint>
                </p>
            )}
        </TableCard>
    )
}
