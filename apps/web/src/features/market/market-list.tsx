"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/data-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prefix } from "@/lib/path"
import { marketColumns } from "./column"
import { useDefaultAssets } from "./hook"
import { SymbolSearch } from "./symbol-search"

export function MarketList() {
    const query = useDefaultAssets()
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
                query={query}
                columns={marketColumns}
                rowKey={(a) => a.symbol}
                onRowClick={(a) => router.push(`${prefix}/market/${a.symbol}`)}
            />
        </>
    )
}
