import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authClient } from "./auth"

export const getSession = cache(async () => {
    const cookie = (await headers()).get("cookie") ?? ""
    const { data } = await authClient.getSession({
        fetchOptions: { headers: { cookie } },
    })
    return data // { session, user } ou null
})

export async function requireSession() {
    const session = await getSession()
    if (!session) redirect("/login")
    return session
}

export async function isAdmin(): Promise<boolean> {
    const session = await getSession();
    const roles = session?.user.role?.split(",").map((role) => role.trim()) ?? [];

    return roles.includes("admin");
}

export function hasAdminRole(role?: string | null): boolean {
    return role?.split(",").some((item) => item.trim() === "admin") ?? false;
}