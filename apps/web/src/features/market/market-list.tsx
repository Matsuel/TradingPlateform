"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { TableCard } from "@/components/data-table/table-card"
import { PAGE_SIZE } from "@/constants/pagination"
import { routes } from "@/lib/routes"
import { marketColumns } from "./column"
import { useDefaultAssets } from "./hook"
import { SymbolSearch } from "./symbol-search"

/** Écran marché : recherche de symbole, puis actifs par défaut paginés côté serveur ; une ligne ouvre le détail du symbole. */
export function MarketList() {
    const [page, setPage] = useState(1)
    const query = useDefaultAssets({ page, pageSize: PAGE_SIZE })
    const router = useRouter()

    return (
        <>
            <div className="flex justify-end">
                <SymbolSearch />
            </div>

            <TableCard>
                <DataTable
                    query={{ ...query, data: query.data?.data }}
                    columns={marketColumns}
                    rowKey={(a) => a.symbol}
                    onRowClick={(a) => router.push(routes.symbol(a.symbol))}
                    pagination={{ page, pageSize: PAGE_SIZE, count: query.data?.count ?? 0, onPageChange: setPage }}
                />
            </TableCard>
        </>
    )
}
