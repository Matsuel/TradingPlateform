import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PageLayout } from "@/components/page-layout"
import { BacktestBatchView } from "@/features/backtest/backtest-batch"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("backtest.batch")
    return { title: t("metaTitle") }
}

export default async function BacktestBatchPage({ params }: PageProps<"/app/backtest/batch/[batchId]">) {
    const { batchId } = await params
    return (
        <PageLayout>
            <BacktestBatchView batchId={batchId} />
        </PageLayout>
    )
}
