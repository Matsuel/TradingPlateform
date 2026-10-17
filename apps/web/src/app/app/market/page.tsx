"use client"
import { DataTable } from "@/components/data-table/data-table"
import PageLayout from "@/components/PageLayout"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { marketColumns } from "@/features/market/column"
import { useDefaultAssets } from "@/features/market/hook"


const MarketPage = () => {

    const query = useDefaultAssets()

    return (
        <PageLayout
            title="Marché"
            description="Prix en temps réel via la plateforme Yahoo finance"
        >
            <div className="w-full h-auto flex flex-row justify-between items-center">

                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="favorites">Favoris</TabsTrigger>
                        <TabsTrigger value="cryptos">Cryptos</TabsTrigger>
                        <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Input
                    className="w-70 focus-visible:ring-0"
                    placeholder="Rechercher un symbole…"
                />
            </div>

            <DataTable query={query} columns={marketColumns} rowKey={(a) => a.symbol} />
        </PageLayout>
    )
}

export default MarketPage