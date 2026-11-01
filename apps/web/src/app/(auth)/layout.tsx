import { redirect } from "next/navigation"
import { routes } from "@/lib/routes"
import { getSession } from "@/lib/session"

// Connexion et inscription : un utilisateur déjà connecté va au dashboard, centré sinon
export default async function AuthLayout({ children }: LayoutProps<"/">) {
    if (await getSession()) redirect(routes.dashboard)

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
        </div>
    )
}
