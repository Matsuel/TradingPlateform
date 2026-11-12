import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PageLayout } from "@/components/page-layout"
import { BacktestCompare } from "@/features/backtest/backtest-compare"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("backtest.compare")
    return { title: t("title") }
}

export default async function BacktestComparePage({ searchParams }: PageProps<"/app/backtest/compare">) {
    const { ids } = await searchParams
    return (
        <PageLayout>
            <BacktestCompare ids={ids} />
        </PageLayout>
    )
}
