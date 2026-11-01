import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Rapports" }

export default function ReportsPage() {
    return (
        <PageLayout>
            <PageHeader title="Rapports" description="Rapports de gestion générés à partir de vos simulations." />
        </PageLayout>
    )
}
