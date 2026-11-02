import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"
import { MarketList } from "@/features/market/market-list"

export const metadata: Metadata = { title: "Marché" }

export default function MarketPage() {
    return (
        <PageLayout>
            <PageHeader title="Marché" description="Prix en temps réel via Yahoo Finance" />
            <MarketList />
        </PageLayout>
    )
}
