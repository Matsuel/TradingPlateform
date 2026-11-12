import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { AuthError, login, register } from "./api"

export function useLogin() {
    return useMutation({ mutationFn: login })
}

export function useRegister() {
    return useMutation({ mutationFn: register })
}

/**
 * Message d'une erreur better-auth dans la langue active (`auth.errors.<code>`) ; `fallback` (libellé d'échec du
 * formulaire) pour un code absent des dictionnaires ou une erreur qui n'est pas une `AuthError` (réseau).
 */
export function useAuthErrorMessage() {
    const t = useTranslations("auth.errors")
    return (error: unknown, fallback: string) => {
        const key = (error instanceof AuthError ? error.code : null) as Parameters<typeof t>[0]
        return key && t.has(key) ? t(key) : fallback
    }
}
