import type { ReactNode } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Trend = "up" | "down" | "neutral"

const trends = {
    up: { variant: "success", icon: <TrendingUp data-icon="inline-start" /> },
    down: { variant: "outline", className: "border-destructive/30 text-destructive", icon: <TrendingDown data-icon="inline-start" /> },
    neutral: { variant: "outline", className: "text-muted-foreground" },
} as const satisfies Record<Trend, { variant: "success" | "outline"; className?: string; icon?: ReactNode }>

interface StatCardProps {
    label: string
    value: ReactNode
    caption?: ReactNode
    delta?: ReactNode
    trend?: Trend
    className?: string
}

export function StatCard({ label, value, caption, delta, trend = "neutral", className }: StatCardProps) {
    const t: { variant: "success" | "outline"; className?: string; icon?: ReactNode } = trends[trend]

    return (
        <Card className={cn("shadow-xs", className)}>
            <CardContent className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-body text-muted-foreground">{label}</span>
                    {delta != null && (
                        <Badge variant={t.variant} className={t.className}>
                            {t.icon}
                            {delta}
                        </Badge>
                    )}
                </div>
                <span className="text-stat">{value}</span>
                {caption && <span className="text-small text-muted-foreground">{caption}</span>}
            </CardContent>
        </Card>
    )
}
