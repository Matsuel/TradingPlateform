"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatChange, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { statusBadges } from "./constants"
import { useRerunBacktest } from "./hook"
import type { BacktestExecution } from "./types"
import { getExecutionDuration } from "./utils"

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
                ? `${e.result.totalTrades} ordres · ${formatChange(Number(e.result.totalReturn) * 100)} %`
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
    const active = e.status === "PENDING" || e.status === "RUNNING"

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
                {active && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        {e.status === "RUNNING" && <div className="h-full w-full animate-pulse rounded-full bg-green-600" />}
                    </div>
                )}
            </div>
            <span className="shrink-0 text-small text-muted-foreground">{duration(e)}</span>
        </div>
    )
}

export function ExecutionHistory({ backtestId, executions }: { backtestId: string; executions: BacktestExecution[] }) {
    const { mutate, isPending } = useRerunBacktest(backtestId)

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Historique d’exécution</CardTitle>
                <CardDescription className="text-small">
                    Relancez ce backtest : chaque exécution conserve son propre état et ses résultats.
                </CardDescription>
                <CardAction>
                    <Button variant="outline" onClick={() => mutate()} disabled={isPending}>
                        Relancer ce backtest
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col">
                {executions.map((e) => <ExecutionRow key={e.id} execution={e} />)}
            </CardContent>
        </Card>
    )
}
