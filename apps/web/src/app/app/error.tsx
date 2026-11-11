"use client"

import { useTranslations } from "next-intl"
import { ErrorState } from "@/components/query-status"

// Erreur de rendu d'une page connectée : la sidebar reste affichée, « Réessayer » relance le rendu du segment
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
    const t = useTranslations("common")
    return <ErrorState message={error.message || t("error")} onRetry={retry} className="h-64" />
}
