import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FormSectionProps {
    title: string
    description?: string
    className?: string
    children: React.ReactNode
}

export function FormSection({
    title,
    description,
    className,
    children,
}: FormSectionProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid gap-4">{children}</CardContent>
        </Card>
    )
}

export function FieldRow({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>
}