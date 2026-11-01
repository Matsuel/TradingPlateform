import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Dashboard" }

export default function DashboardPage() {
    return (
        <PageLayout>
            <PageHeader title="Dashboard" description="Vue d’ensemble de vos backtests, portefeuilles et signaux récents." />
        </PageLayout>
    )
}
