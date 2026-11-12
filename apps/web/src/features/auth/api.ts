import { signIn, signUp } from "@/lib/auth"
import type { LoginValues, RegisterValues } from "./schema"

/** Erreur better-auth ; `code` (`INVALID_EMAIL_OR_PASSWORD`…) est traduit par `auth.errors.<code>`, `null` s'il est absent. */
export class AuthError extends Error {
    readonly code: string | null

    constructor(error: { code?: string; message?: string }) {
        super(error.message)
        this.code = error.code ?? null
    }
}

// Les routes /api/auth passent par le client better-auth (cookies de session), pas par apiFetch.
// Une erreur better-auth est relancée en `AuthError` pour que les mutations TanStack la portent ; le formulaire
// affiche `auth.errors.<code>`, ou son libellé d'échec traduit si le code est inconnu.
export async function login(values: LoginValues): Promise<void> {
    const { error } = await signIn.email(values)
    if (error) throw new AuthError(error)
}

export async function register(values: RegisterValues): Promise<void> {
    const { error } = await signUp.email(values)
    if (error) throw new AuthError(error)
}
