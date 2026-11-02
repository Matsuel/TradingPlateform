import type { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { BacktestDetail } from "@/features/backtest/backtest-detail"

export const metadata: Metadata = { title: "Backtest" }

export default async function BacktestDetailPage({ params }: PageProps<"/app/backtest/[id]">) {
    const { id } = await params
    return (
        <PageLayout>
            <BacktestDetail id={id} />
        </PageLayout>
    )
}
