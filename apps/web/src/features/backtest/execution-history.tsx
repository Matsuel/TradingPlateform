"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatRatio } from "@/lib/format"
import { cn } from "@/lib/utils"
import { statusBadges } from "./constants"
import type { BacktestExecution } from "./types"
import { getExecutionDuration, isActive } from "./utils"

function describe(e: BacktestExecution) {
    switch (e.status) {
        case "PENDING":
            return "En file d’attente"
        case "RUNNING":
            return "Calcul en cours"
        case "FAILED":
            return e.error ?? "Erreur inconnue"
        case "COMPLETED":
            return e.result
                ? `${e.result.totalTrades} ordres · ${formatRatio(Number(e.result.totalReturn))}`
                : "Terminé"
        default:
            return statusBadges[e.status].label
    }
}

function duration(e: BacktestExecution) {
    const d = getExecutionDuration(e)
    if (e.status === "FAILED" && d) return `Après ${d}`
    return d ?? statusBadges[e.status].label
}

function ExecutionRow({ execution: e }: { execution: BacktestExecution }) {
    const { label, variant } = statusBadges[e.status]

    return (
        <div className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
            <div className="flex w-full max-w-165 flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-body-medium">#{e.attempt}</span>
                    <Badge variant={variant}>{label}</Badge>
                </div>
                <span className={cn("text-small text-muted-foreground", e.status === "FAILED" && "text-destructive")}>
                    {formatDate(e.createdAt)} · {describe(e)}
                </span>
                {isActive(e) && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        {e.status === "RUNNING" && <div className="h-full w-full animate-pulse rounded-full bg-green-600" />}
                    </div>
                )}
            </div>
            <span className="shrink-0 text-small text-muted-foreground">{duration(e)}</span>
        </div>
    )
}

interface ExecutionHistoryProps {
    executions: BacktestExecution[]
    actions?: ReactNode // ex. bouton de relance
}

export function ExecutionHistory({ executions, actions }: ExecutionHistoryProps) {
    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Historique d’exécution</CardTitle>
                <CardDescription className="text-small">
                    Relancez ce backtest : chaque exécution conserve son propre état et ses résultats.
                </CardDescription>
                {actions && <CardAction>{actions}</CardAction>}
            </CardHeader>
            <CardContent className="flex flex-col">
                {executions.map((e) => <ExecutionRow key={e.id} execution={e} />)}
            </CardContent>
        </Card>
    )
}
