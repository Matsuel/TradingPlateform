import { cn } from 'cn'
import React from 'react'

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description: string
}

const PageLayout = ({
    title,
    description,
    children,
    className,
    ...props
}: PageLayoutProps) => {
    return (
        <div className={cn("w-full min-h-screen px-8 py-6", className)} {...props}>
            <div>
                <h2 className='text-h2'>
                    {title}
                </h2>
                <p className='text-body text-muted-foreground'>
                    {description}
                </p>
            </div>
            {children}
        </div>
    )
}

export default PageLayout