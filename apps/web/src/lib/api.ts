import { z } from "zod"
import { env } from "./env"

const codeBodySchema = z.object({ code: z.string() })

/** Réponse non 2xx de core-backend : `body` = corps d'erreur `{ error, ...data }`, `null` s'il n'est pas du JSON. */
export class ApiError extends Error {
    readonly status: number
    readonly body: unknown
    /** Code stable du corps d'erreur (`ApiErrorCode`), `null` s'il est absent (erreur relayée de market-service, réseau). */
    readonly code: string | null

    constructor(status: number, statusText: string, body: unknown) {
        super(`Erreur API : ${status} ${statusText}`)
        this.status = status
        this.body = body
        const parsed = codeBodySchema.safeParse(body)
        this.code = parsed.success ? parsed.data.code : null
    }
}

// 400 de validation : `{ error, issues: [ZodIssue] }` (apps/core-backend/API.md)
const issuesBodySchema = z.object({
    issues: z.array(
        z.object({
            path: z.array(z.union([z.string(), z.number()])),
            // Code stable des issues personnalisées du backend (`params.code`) ; absent pour une issue zod native
            params: z.object({ code: z.string() }).optional(),
        }),
    ),
})

/**
 * Issues zod d'un `400` de core-backend, chemin joint par des points (`"allocations.0.weight"`) pour `setError`.
 * `code` = code stable de l'issue, `null` pour une issue zod native.
 * `[]` pour toute autre erreur ; une issue sans chemin (racine du body) est ignorée.
 */
export function apiIssues(error: unknown): { path: string; code: string | null }[] {
    if (!(error instanceof ApiError) || error.status !== 400) return []
    const parsed = issuesBodySchema.safeParse(error.body)
    if (!parsed.success) return []
    return parsed.data.issues
        .filter((issue) => issue.path.length > 0)
        .map((issue) => ({ path: issue.path.join("."), code: issue.params?.code ?? null }))
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
