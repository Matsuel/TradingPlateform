import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form"
import { apiIssues } from "@/lib/api"

/**
 * Place chaque issue zod d'un `400` de core-backend sous le champ de son chemin (`form.setError`) ; toute autre erreur
 * est ignorée ici : l'écran l'affiche depuis la mutation.
 */
export function setFormIssues<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
    for (const { path, message } of apiIssues(error)) setError(path as FieldPath<T>, { message })
}
