import { cn } from 'cn'
import React, { ReactNode } from 'react'

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    leading?: ReactNode
    actions?: ReactNode
}

const PageHeader = ({
    title,
    description,
    leading,
    actions,
    className
}: PageHeaderProps) => {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {leading}
            <div className="flex flex-1 flex-col gap-1">
                <h2 className="text-h2">{title}</h2>
                {description && <p className="text-body text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}

export default PageHeader