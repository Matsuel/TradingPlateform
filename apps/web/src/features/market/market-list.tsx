"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/data-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PAGE_SIZE } from "@/constants/pagination"
import { prefix } from "@/lib/path"
import { marketColumns } from "./column"
import { useDefaultAssets } from "./hook"
import { SymbolSearch } from "./symbol-search"

export function MarketList() {
    const [page, setPage] = useState(1)
    const query = useDefaultAssets({ page, pageSize: PAGE_SIZE })
    const router = useRouter()

    return (
        <>
            <div className="w-full h-auto flex flex-row justify-between items-center">

                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="favorites">Favoris</TabsTrigger>
                        <TabsTrigger value="cryptos">Cryptos</TabsTrigger>
                        <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
                    </TabsList>
                </Tabs>

                <SymbolSearch />
            </div>

            <DataTable
                query={{ ...query, data: query.data?.data }}
                columns={marketColumns}
                rowKey={(a) => a.symbol}
                onRowClick={(a) => router.push(`${prefix}/market/${a.symbol}`)}
                pagination={{ page, pageSize: PAGE_SIZE, count: query.data?.count ?? 0, onPageChange: setPage }}
            />
        </>
    )
}
