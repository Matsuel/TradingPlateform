import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader, PageLayout } from "@/components/page-layout"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("navigation.tabs")
    return { title: t("paperTrading") }
}

export default function PaperTradingPage() {
    const t = useTranslations()

    return (
        <PageLayout>
            <PageHeader title={t("navigation.tabs.paperTrading")} description={t("pages.paperTrading.description")} />
        </PageLayout>
    )
}
