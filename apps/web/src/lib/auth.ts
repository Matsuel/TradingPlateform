import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { env } from "./env"

// URL complète des routes better-auth de core-backend (`/api/auth`), même hôte que apiFetch
export const authClient = createAuthClient({
    baseURL: `${env.NEXT_PUBLIC_API_URL}/auth`,
    plugins: [adminClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient
