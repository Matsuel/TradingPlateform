import { useTranslations } from "next-intl"
import { ApiError } from "./api"

/**
 * Traducteurs des erreurs de core-backend vers la langue active (`errors.<code>` des dictionnaires).
 * Un code absent des dictionnaires, ou une erreur qui n'est pas une `ApiError`, donne `errors.generic`.
 */
export function useApiErrorMessages() {
    const t = useTranslations("errors")

    // Le code vient du réseau : `has` le vérifie à l'exécution, le type de clé ne peut pas
    const issueMessage = (code: string | null) => {
        const key = code as Parameters<typeof t>[0]
        return code && t.has(key) ? t(key) : t("generic")
    }
    const errorMessage = (error: unknown) => issueMessage(error instanceof ApiError ? error.code : null)

    return { errorMessage, issueMessage }
}
