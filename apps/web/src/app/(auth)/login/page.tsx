import type { Metadata } from "next"
import { LoginForm } from "@/features/auth/login-form"
import { safeRedirect } from "@/lib/routes"

export const metadata: Metadata = { title: "Connexion" }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
    const { redirect } = await searchParams
    return <LoginForm redirectTo={safeRedirect(typeof redirect === "string" ? redirect : undefined)} />
}
