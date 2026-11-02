import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Paramètres" }

export default function SettingsPage() {
    return (
        <PageLayout>
            <PageHeader title="Paramètres" description="Gérez votre profil, vos notifications et l’apparence." />
        </PageLayout>
    )
}
