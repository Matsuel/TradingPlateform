import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader, PageLayout } from "@/components/page-layout"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("navigation.tabs")
    return { title: t("projection") }
}

export default function ProjectionPage() {
    const t = useTranslations()

    return (
        <PageLayout>
            <PageHeader title={t("navigation.tabs.projection")} description={t("pages.projection.description")} />
        </PageLayout>
    )
}
