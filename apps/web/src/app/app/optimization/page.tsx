import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Optimisation" }

export default function OptimizationPage() {
    return (
        <PageLayout>
            <PageHeader title="Optimisation" description="Explorateur d’allocations et frontière efficiente." />
        </PageLayout>
    )
}
