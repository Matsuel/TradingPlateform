"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { TableCard } from "@/components/data-table/table-card"
import { Button } from "@/components/ui/button"
import { PAGE_SIZE } from "@/constants/pagination"
import { paginate } from "@/lib/pagination"
import { useTradeColumns } from "./column"
import type { Trade } from "./types"

// Ordres affichés avant « Voir les N ordres » : les plus récents
const RECENT_TRADES = 5

/**
 * Table « Ordres » d'un résultat : les `RECENT_TRADES` plus récents, puis sur demande tous, paginés côté client,
 * du plus récent au plus ancien. `trades` : ordres du moteur, du plus ancien au plus récent.
 */
export function TradesTable({ trades }: { trades: Trade[] }) {
    const t = useTranslations("backtest.trades")
    const columns = useTradeColumns()
    const [showAll, setShowAll] = useState(false)
    const [page, setPage] = useState(1)
    const newestFirst = trades.toReversed()

    return (
        <TableCard
            title={t("title")}
            description={
                showAll
                    ? t("all")
                    : t("recent", { shown: Math.min(RECENT_TRADES, trades.length), total: trades.length })
            }
            actions={
                trades.length > RECENT_TRADES && (
                    <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
                        {showAll ? t("showRecent") : t("seeAll", { count: trades.length })}
                    </Button>
                )
            }
        >
            <DataTable
                rows={showAll ? paginate(newestFirst, page, PAGE_SIZE) : newestFirst.slice(0, RECENT_TRADES)}
                columns={columns}
                rowKey={(t) => `${t.date}-${t.symbol}-${t.side}-${t.amount}`}
                emptyMessage={t("empty")}
                pagination={
                    showAll ? { page, pageSize: PAGE_SIZE, count: trades.length, onPageChange: setPage } : undefined
                }
            />
        </TableCard>
    )
}
