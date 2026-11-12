import type { Metadata } from "next"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { PageHeader, PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { BacktestList } from "@/features/backtest/backtest-list"
import { routes } from "@/lib/routes"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("backtest.list")
    return { title: t("title") }
}

export default function BacktestsPage() {
    const t = useTranslations("backtest.list")

    return (
        <PageLayout>
            <PageHeader
                title={t("title")}
                description={t("description")}
                actions={
                    <Button nativeButton={false} render={<Link href={routes.newBacktest} />}>
                        {t("action")}
                    </Button>
                }
            />
            <BacktestList />
        </PageLayout>
    )
}
