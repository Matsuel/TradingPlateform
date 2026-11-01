import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form"
import { z } from "zod"
import { env } from "./env"

/** Réponse non 2xx de core-backend : `body` = corps d'erreur `{ error, ...data }`, `null` s'il n'est pas du JSON. */
export class ApiError extends Error {
    readonly status: number
    readonly body: unknown

    constructor(status: number, statusText: string, body: unknown) {
        super(`Erreur API : ${status} ${statusText}`)
        this.status = status
        this.body = body
    }
}

// 400 de validation : `{ error, issues: [ZodIssue] }` (apps/core-backend/API.md)
const issuesBodySchema = z.object({
    issues: z.array(
        z.object({
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string(),
        }),
    ),
})

/**
 * Place chaque issue zod d'un `400` de core-backend sous le champ de son chemin (`form.setError`) ; toute autre erreur
 * est ignorée ici : l'écran l'affiche depuis la mutation.
 */
export function setFormIssues<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
    for (const { path, message } of apiIssues(error)) setError(path as FieldPath<T>, { message })
}

/**
 * Issues zod d'un `400` de core-backend, chemin joint par des points (`"allocations.0.weight"`) pour `setError`.
 * `[]` pour toute autre erreur ; une issue sans chemin (racine du body) est ignorée.
 */
function apiIssues(error: unknown): { path: string; message: string }[] {
    if (!(error instanceof ApiError) || error.status !== 400) return []
    const parsed = issuesBodySchema.safeParse(error.body)
    if (!parsed.success) return []
    return parsed.data.issues
        .filter((issue) => issue.path.length > 0)
        .map((issue) => ({ path: issue.path.join("."), message: issue.message }))
}

/**
 * Appel JSON à core-backend avec les cookies de session ; `path` relatif à `NEXT_PUBLIC_API_URL` (`"/backtest"`).
 * Lève `ApiError` sur une réponse non 2xx ; une réponse 204 renvoie `undefined`.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
        ...init,
        headers: {
            Accept: "application/json",
            ...init?.headers,
        },
        credentials: "include",
    })

    if (!response.ok) {
        throw new ApiError(response.status, response.statusText, await response.json().catch(() => null))
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
}
