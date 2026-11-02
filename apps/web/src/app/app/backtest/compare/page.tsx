import type { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { BacktestCompare } from "@/features/backtest/backtest-compare"

export const metadata: Metadata = { title: "Comparaison" }

export default async function BacktestComparePage({ searchParams }: PageProps<"/app/backtest/compare">) {
    const { ids } = await searchParams
    return (
        <PageLayout>
            <BacktestCompare ids={ids} />
        </PageLayout>
    )
}
