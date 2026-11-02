import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Conteneur d'une page de l'app : colonne pleine largeur, marges et espacement entre sections. */
export function PageLayout({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex w-full flex-1 flex-col gap-6 px-8 py-6", className)} {...props} />
}

interface PageHeaderProps {
    title?: string
    description?: string
    badge?: ReactNode // à droite du titre, ex. statut
    leading?: ReactNode // avant le titre, ex. logo du symbole
    actions?: ReactNode // boutons alignés à droite
    className?: string
}

/** En-tête d'une page : `h2` du titre, description, slots `leading`, `badge` et `actions`. */
export function PageHeader({ title, description, badge, leading, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {leading}
            <div className="flex flex-1 flex-col gap-1">
                {title && (
                    <div className="flex items-center gap-3">
                        <h2 className="text-h2">{title}</h2>
                        {badge}
                    </div>
                )}
                {description && <p className="text-body text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}
