import type { ReactNode } from "react"
import { InfoHint } from "@/components/info-hint"
import type { GlossaryKey } from "@/constants/glossary"
import { cn } from "@/lib/utils"

interface DetailRowProps {
    label: string
    hint?: GlossaryKey // aide du libellé ; absente, libellé seul
    divided?: boolean // trait sous la ligne (liste d'hypothèses)
    children: ReactNode // valeur déjà formatée
}

/** Ligne d'une liste `<dl>` : libellé atténué à gauche (avec son aide), valeur à droite. */
export function DetailRow({ label, hint, divided, children }: DetailRowProps) {
    return (
        <div className={cn("flex items-start gap-4", divided && "border-b py-2")}>
            <dt className="flex-1 text-muted-foreground">
                <InfoHint entry={hint}>{label}</InfoHint>
            </dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}
