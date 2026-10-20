"use client"
import { DataTable } from "@/components/data-table/data-table"
import PageLayout from "@/components/page-layout"
import PageHeader from "@/components/page-layout/header"
import SymbolSearch from "@/components/symbol-search"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { marketColumns } from "@/features/market/column"
import { useDefaultAssets } from "@/features/market/hook"
import { useRouter } from "next/navigation"


const MarketPage = () => {

    const query = useDefaultAssets()
    const router = useRouter()

    return (
        <PageLayout>
            <PageHeader
                title="Marché"
                description="Prix en temps réel via Yahoo Finance"
            />

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
                onRowClick={(a) => router.push(`/app/market/${a.symbol}`)}
            />
        </PageLayout>
    )
}

export default MarketPage