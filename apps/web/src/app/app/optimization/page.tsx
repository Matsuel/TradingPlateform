import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader, PageLayout } from "@/components/page-layout"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("navigation.tabs")
    return { title: t("optimization") }
}

export default function OptimizationPage() {
    const t = useTranslations()

    return (
        <PageLayout>
            <PageHeader title={t("navigation.tabs.optimization")} description={t("pages.optimization.description")} />
        </PageLayout>
    )
}
