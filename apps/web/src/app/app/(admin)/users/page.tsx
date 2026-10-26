import PageLayout from "@/components/page-layout"
import PageHeader from "@/components/page-layout/header"

const UsersPage = () => {
    return (
        <PageLayout>
            <PageHeader
                title="Utilisateurs"
                description="Gérez les comptes, les rôles et les accès à la plateforme."
            />
        </PageLayout>
    )
}

export default UsersPage