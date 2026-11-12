import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader, PageLayout } from "@/components/page-layout"
import { NewBacktestForm } from "@/features/backtest/new-backtest-form"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("backtest.new")
    return { title: t("title") }
}

export default function NewBacktestPage() {
    const t = useTranslations("backtest.new")

    return (
        <PageLayout>
            <PageHeader title={t("title")} description={t("description")} />
            <NewBacktestForm />
        </PageLayout>
    )
}
