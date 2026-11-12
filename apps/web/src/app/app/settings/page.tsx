import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader, PageLayout } from "@/components/page-layout"
import { SettingsTabs } from "@/features/settings/settings-tabs"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("settings")
    return { title: t("title") }
}

export default function SettingsPage() {
    const t = useTranslations("settings")

    return (
        <PageLayout>
            <PageHeader title={t("title")} description={t("description")} />
            <SettingsTabs />
        </PageLayout>
    )
}
