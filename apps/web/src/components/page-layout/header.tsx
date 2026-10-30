import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title?: string
    badge?: ReactNode // à droite du titre, ex. statut
    description?: string
    leading?: ReactNode
    actions?: ReactNode
}

const PageHeader = ({
    title,
    badge,
    description,
    leading,
    actions,
    className
}: PageHeaderProps) => {
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

export default PageHeader