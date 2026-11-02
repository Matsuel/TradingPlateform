import type { Metadata } from "next"
import { PageHeader, PageLayout } from "@/components/page-layout"

export const metadata: Metadata = { title: "Utilisateurs" }

export default function UsersPage() {
    return (
        <PageLayout>
            <PageHeader title="Utilisateurs" description="Gérez les comptes, les rôles et les accès à la plateforme." />
        </PageLayout>
    )
}
