import PageLayout from "@/components/PageLayout"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MarketPage = () => {
    return (
        <PageLayout
            title="Marché"
            description="Prix en temps réel via le flux WebSocket Binance."
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
        </PageLayout>
    )
}

export default MarketPage