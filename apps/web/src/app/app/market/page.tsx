import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader, PageLayout } from "@/components/page-layout"
import { MarketList } from "@/features/market/market-list"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("market")
    return { title: t("title") }
}

export default function MarketPage() {
    const t = useTranslations("market")

    return (
        <PageLayout>
            <PageHeader title={t("title")} description={t("description")} />
            <MarketList />
        </PageLayout>
    )
}
