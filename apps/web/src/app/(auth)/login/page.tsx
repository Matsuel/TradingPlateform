import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LoginForm } from "@/features/auth/login-form"
import { safeRedirect } from "@/lib/routes"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("auth.login")
    return { title: t("title") }
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
    const { redirect } = await searchParams
    return <LoginForm redirectTo={safeRedirect(typeof redirect === "string" ? redirect : undefined)} />
}
