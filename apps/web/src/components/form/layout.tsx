import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FormSection({
    title,
    description,
    className,
    children,
}: {
    title: string
    description?: string
    className?: string
    children: React.ReactNode
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-sm">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid gap-4">{children}</CardContent>
        </Card>
    )
}

export function FieldRow({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>
}