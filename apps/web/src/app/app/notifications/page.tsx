import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Notifications" }

export default function NotificationsPage() {
    return (
        <PageLayout>
            <PageHeader title="Notifications" description="Résultats de simulation et signaux reçus, lus ou non lus." />
        </PageLayout>
    )
}
