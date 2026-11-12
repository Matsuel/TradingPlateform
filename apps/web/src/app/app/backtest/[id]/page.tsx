import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PageLayout } from "@/components/page-layout"
import { BacktestDetail } from "@/features/backtest/backtest-detail"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("backtest.detail")
    return { title: t("metaTitle") }
}

export default async function BacktestDetailPage({ params }: PageProps<"/app/backtest/[id]">) {
    const { id } = await params
    return (
        <PageLayout>
            <BacktestDetail id={id} />
        </PageLayout>
    )
}
