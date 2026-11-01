import { redirect } from "next/navigation"
import { routes } from "@/lib/routes"
import { isAdmin, requireSession } from "@/lib/session"

// Pages d'administration : réservées au rôle admin, les autres utilisateurs reviennent au dashboard
export default async function AdminLayout({ children }: LayoutProps<"/app">) {
    await requireSession()
    if (!(await isAdmin())) redirect(routes.dashboard)
    return children
}
