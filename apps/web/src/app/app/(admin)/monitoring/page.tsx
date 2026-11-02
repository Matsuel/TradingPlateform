import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Monitoring" }

export default function MonitoringPage() {
    return (
        <PageLayout>
            <PageHeader title="Monitoring" description="État des microservices, lag Kafka et exécutions en cours." />
        </PageLayout>
    )
}
