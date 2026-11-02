import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Paper trading" }

export default function PaperTradingPage() {
    return (
        <PageLayout>
            <PageHeader
                title="Paper trading"
                description="Stratégies suivies à partir d’aujourd’hui sur un portefeuille virtuel."
            />
        </PageLayout>
    )
}
