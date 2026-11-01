import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Données de référence" }

export default function ReferenceDataPage() {
    return (
        <PageLayout>
            <PageHeader
                title="Données de référence"
                description="Instruments importés, historiques de cours et versions du jeu de données."
            />
        </PageLayout>
    )
}
