import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"
import { NewBacktestForm } from "@/features/backtest/new-backtest-form"

export const metadata: Metadata = { title: "Nouveau backtest" }

export default function NewBacktestPage() {
    return (
        <PageLayout>
            <PageHeader
                title="Nouveau backtest"
                description="Configurez une stratégie : un test sera effectué afin de voir si cette stratégie est la bonne"
            />
            <NewBacktestForm />
        </PageLayout>
    )
}
