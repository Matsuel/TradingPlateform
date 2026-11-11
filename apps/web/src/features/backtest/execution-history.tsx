import { Progress } from "@/components/ui/progress"
import { type Formatters, useFormatters } from "@/lib/format"
import { cn } from "@/lib/utils"
import { statusBadges } from "./constants"
import { StatusBadge } from "./status-badge"
import type { BacktestExecution } from "./types"
import { getExecutionDuration, isActive } from "./utils"

function describe(f: Formatters, e: BacktestExecution) {
    switch (e.status) {
        case "PENDING":
            return "En file d’attente"
        case "RUNNING":
            return "Calcul en cours"
        case "FAILED":
            return e.error ?? "Erreur inconnue"
        case "COMPLETED":
            return e.result
                ? `${e.result.totalTrades} ordres · ${f.formatRatio(Number(e.result.totalReturn))}`
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
    const f = useFormatters()

    return (
        <div className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
            <div className="flex w-full max-w-165 flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-body-medium">#{e.attempt}</span>
                    <StatusBadge status={e.status} />
                </div>
                <span className={cn("text-small text-muted-foreground", e.status === "FAILED" && "text-destructive")}>
                    {f.formatDate(e.createdAt)} · {describe(f, e)}
                </span>
                {isActive(e) && (
                    <Progress
                        aria-label={e.status === "RUNNING" ? "Calcul en cours" : "En file d’attente"}
                        value={e.status === "RUNNING" ? 100 : 0}
                        variant="running"
                        size="md"
                        className="mt-1 w-full"
                    />
                )}
            </div>
            <span className="shrink-0 text-small text-muted-foreground">{duration(e)}</span>
        </div>
    )
}

/** Exécutions d'un backtest, de la plus récente à la plus ancienne : statut, résumé ou cause d'échec, durée. */
export function ExecutionList({ executions }: { executions: BacktestExecution[] }) {
    return (
        <div className="flex flex-col">
            {executions.map((e) => (
                <ExecutionRow key={e.id} execution={e} />
            ))}
        </div>
    )
}
