import { z } from "zod"

// Lue littéralement : Next ne remplace dans le bundle client que `process.env.NEXT_PUBLIC_*` écrit en entier
const parsed = z
    .object({ NEXT_PUBLIC_API_URL: z.url() })
    .safeParse({ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL })

if (!parsed.success) {
    throw new Error(`Variables d'environnement invalides : ${z.prettifyError(parsed.error)}`)
}

/** Variables d'environnement du web, validées au chargement. `NEXT_PUBLIC_API_URL` : base des routes de core-backend (`…/api`). */
export const env = parsed.data
