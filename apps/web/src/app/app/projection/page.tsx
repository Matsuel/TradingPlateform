import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Projection" }

export default function ProjectionPage() {
    return (
        <PageLayout>
            <PageHeader title="Projection" description="Futurs plausibles d’un portefeuille par simulation Monte Carlo." />
        </PageLayout>
    )
}
