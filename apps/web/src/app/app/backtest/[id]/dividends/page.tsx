import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PageLayout } from "@/components/page-layout"
import { BacktestDividends } from "@/features/backtest/backtest-dividends"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("backtest.dividends")
    return { title: t("metaTitle") }
}

export default async function BacktestDividendsPage({ params }: PageProps<"/app/backtest/[id]/dividends">) {
    const { id } = await params
    return (
        <PageLayout>
            <BacktestDividends id={id} />
        </PageLayout>
    )
}
