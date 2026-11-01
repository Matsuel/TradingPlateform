import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader, PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { BacktestList } from "@/features/backtest/backtest-list"
import { routes } from "@/lib/routes"

export const metadata: Metadata = { title: "Backtests" }

export default function BacktestsPage() {
    return (
        <PageLayout>
            <PageHeader
                title="Backtests"
                description="Historique des runs de stratégies exécutés."
                actions={
                    <Button nativeButton={false} render={<Link href={routes.newBacktest} />}>
                        Nouveau backtest
                    </Button>
                }
            />
            <BacktestList />
        </PageLayout>
    )
}
