import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const PageLayout = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn("flex w-full flex-1 flex-col gap-6 px-8 py-6", className)} {...props} />
    )
}

export default PageLayout