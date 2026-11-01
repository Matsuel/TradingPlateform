import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { hasAdminRole, requireSession } from "@/lib/session"

// Pages connectées : session exigée côté serveur, sidebar selon le rôle ; SidebarInset rend le <main>
export default async function AppLayout({ children }: LayoutProps<"/app">) {
    const session = await requireSession()

    return (
        <SidebarProvider>
            <AppSidebar user={session.user} isAdmin={hasAdminRole(session.user.role)} />
            <SidebarInset>
                <AppHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
