import type { Column } from "@/components/data-table/data-table"
import { ChangeCell } from "@/components/data-table/cells"
import { Badge } from "@/components/ui/badge"
import { formatDay } from "@/lib/format"
import type { Backtest, ExecutionStatus } from "./types"

const strategyLabels = {
    RECURRING: "DCA mensuel",
    LUMP_SUM: "Lump sum",
} as const

const statusBadges: Record<ExecutionStatus, { label: string; variant: "outline" | "destructive" | "secondary" | "success" }> = {
    PENDING: { label: "En attente", variant: "outline" },
    RUNNING: { label: "En cours", variant: "outline" },
    COMPLETED: { label: "Terminé", variant: "success" },
    FAILED: { label: "Échoué", variant: "destructive" },
    CANCELLED: { label: "Annulé", variant: "secondary" },
}

const dash = <span className="text-muted-foreground">—</span>

export const getExecution = (b: Backtest) => b.executions[0]

function duration(b: Backtest) {
    const e = getExecution(b)
    if (!e?.startedAt || !e.finishedAt) return null
    const minutes = Math.max(1, Math.round((+new Date(e.finishedAt) - +new Date(e.startedAt)) / 60_000))
    return `${minutes} min`
}

export const backtestColumns: Column<Backtest>[] = [
    { header: "Nom", cell: (b) => <span className="text-body-medium">{b.name}</span> },
    { header: "Stratégie", cell: (b) => strategyLabels[b.investmentMode] },
    { header: "Symboles", cell: (b) => `${b.symbols.length} symbole${b.symbols.length > 1 ? "s" : ""}` },
    { header: "Période", cell: (b) => `${formatDay(b.startDate)} – ${formatDay(b.endDate)}` },
    {
        header: "Rendement",
        className: "text-right",
        cell: (b) => {
            const value = getExecution(b)?.result?.totalReturn
            return value == null ? dash : <ChangeCell value={Number(value) * 100} />
        },
    },
    {
        header: "Statut",
        className: "text-center",
        cell: (b) => {
            const e = getExecution(b)
            if (!e) return dash
            const { label, variant } = statusBadges[e.status]
            return <Badge variant={variant}>{label}</Badge>
        },
    },
    { header: "Durée", className: "text-right", cell: (b) => duration(b) ?? dash },
]
