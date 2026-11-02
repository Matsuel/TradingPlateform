import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Empty, EmptyDescription } from "@/components/ui/empty"

/** Carte d'état vide : un message centré à la place d'un contenu pas encore disponible (sélection, calcul en cours). */
export function EmptyCard({ children }: { children: ReactNode }) {
    return (
        <Card>
            <Empty className="h-40">
                <EmptyDescription>{children}</EmptyDescription>
            </Empty>
        </Card>
    )
}
