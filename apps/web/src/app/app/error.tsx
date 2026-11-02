"use client"

import { ErrorState } from "@/components/query-status"

// Erreur de rendu d'une page connectée : la sidebar reste affichée, « Réessayer » relance le rendu du segment
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
    return <ErrorState message={error.message || "Une erreur est survenue."} onRetry={retry} className="h-64" />
}
