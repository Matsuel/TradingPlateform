"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LoadingState({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
    )
}

interface ErrorStateProps {
    message?: string
    onRetry: () => unknown
    className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}>
            <p className="text-sm text-destructive">{message}</p>
            <Button variant="outline" size="sm" onClick={() => onRetry()}>Réessayer</Button>
        </div>
    )
}
