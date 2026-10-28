import PageLayout from "@/components/page-layout"
import PageHeader from "@/components/page-layout/header"
import { MarketList } from "@/features/market/market-list"

const MarketPage = () => {
    return (
        <PageLayout>
            <PageHeader
                title="Marché"
                description="Prix en temps réel via Yahoo Finance"
            />
            <MarketList />
        </PageLayout>
    )
}

export default MarketPage
