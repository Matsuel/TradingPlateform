import { useTranslations } from "next-intl"
import { Progress } from "@/components/ui/progress"
import { type Formatters, useFormatters } from "@/lib/format"
import { cn } from "@/lib/utils"
import { StatusBadge } from "./status-badge"
import type { BacktestExecution } from "./types"
import { type BacktestTranslator, executionErrorLabel, getExecutionDuration, isActive } from "./utils"

function describe(f: Formatters, t: BacktestTranslator, e: BacktestExecution) {
    switch (e.status) {
        case "PENDING":
            return t("history.pending")
        case "RUNNING":
            return t("history.running")
        case "FAILED":
            return executionErrorLabel(t, e, t("history.unknownError"))
        case "COMPLETED":
            return e.result
                ? t("history.completedSummary", {
                      count: e.result.totalTrades,
                      return: f.formatRatio(Number(e.result.totalReturn)),
                  })
                : t("history.completed")
        default:
            return t(`status.${e.status}`)
    }
}

function duration(t: BacktestTranslator, e: BacktestExecution) {
    const d = getExecutionDuration(t, e)
    if (e.status === "FAILED" && d) return t("duration.after", { duration: d })
    return d ?? t(`status.${e.status}`)
}

function ExecutionRow({ execution: e }: { execution: BacktestExecution }) {
    const f = useFormatters()
    const t = useTranslations("backtest")

    return (
        <div className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
            <div className="flex w-full max-w-165 flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-body-medium">#{e.attempt}</span>
                    <StatusBadge status={e.status} />
                </div>
                <span className={cn("text-small text-muted-foreground", e.status === "FAILED" && "text-destructive")}>
                    {f.formatDate(e.createdAt)} · {describe(f, t, e)}
                </span>
                {isActive(e) && (
                    <Progress
                        aria-label={e.status === "RUNNING" ? t("history.running") : t("history.pending")}
                        value={e.status === "RUNNING" ? 100 : 0}
                        variant="running"
                        size="md"
                        className="mt-1 w-full"
                    />
                )}
            </div>
            <span className="shrink-0 text-small text-muted-foreground">{duration(t, e)}</span>
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
