import type { Column } from "@/components/data-table/data-table"
import { ChangeCell } from "@/components/data-table/cells"
import { Badge } from "@/components/ui/badge"
import { formatDay } from "@/lib/format"
import { statusBadges, strategyLabels } from "./constants"
import type { Backtest } from "./types"
import { getDuration, getExecution } from "./utils"
import Dash from "@/components/custom/Dash"

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
            return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
        },
    },
    {
        header: "Statut",
        className: "text-center",
        cell: (b) => {
            const e = getExecution(b)
            if (!e) return <Dash />
            const { label, variant } = statusBadges[e.status]
            return <Badge variant={variant}>{label}</Badge>
        },
    },
    { header: "Durée", className: "text-right", cell: (b) => getDuration(b) ?? <Dash /> },
]
