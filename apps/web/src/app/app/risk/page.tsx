import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Risque" }

export default function RiskPage() {
    return (
        <PageLayout>
            <PageHeader title="Risque" description="Corrélations, concentration, VaR/CVaR et contribution au risque d’un portefeuille." />
        </PageLayout>
    )
}
