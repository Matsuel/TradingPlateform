import { useTranslations } from "next-intl"
import { Dash } from "@/components/dash"
import { ChangeCell } from "@/components/data-table/cells"
import type { Column } from "@/components/data-table/data-table"
import { InfoHint } from "@/components/info-hint"
import { useFormatters } from "@/lib/format"
import { StatusBadge } from "./status-badge"
import type { Backtest } from "./types"
import { formatAllocation, getExecution, getExecutionDuration } from "./utils"

export function useBacktestColumns(): Column<Backtest>[] {
    const f = useFormatters()
    const t = useTranslations("backtest")

    return [
        { header: t("columns.name"), cell: (b) => <span className="text-body-medium">{b.name}</span> },
        { header: t("columns.strategy"), cell: (b) => t(`strategy.${b.investmentMode}`) },
        {
            header: t("columns.allocation"),
            cell: (b) => {
                const allocation = formatAllocation(f, b.allocations)
                return (
                    <span className="block max-w-56 truncate" title={allocation}>
                        {allocation}
                    </span>
                )
            },
        },
        { header: t("columns.period"), cell: (b) => f.formatDayRange(b.startDate, b.endDate) },
        {
            header: <InfoHint entry="totalReturn">{t("columns.return")}</InfoHint>,
            className: "text-right",
            cell: (b) => {
                const value = getExecution(b)?.result?.totalReturn
                return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
            },
        },
        {
            header: <InfoHint entry="cagr">{t("columns.cagr")}</InfoHint>,
            className: "text-right",
            cell: (b) => {
                // Dernière exécution non terminée ou résultat antérieur aux métriques : pas de CAGR
                const value = getExecution(b)?.result?.cagr
                return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
            },
        },
        {
            header: t("columns.status"),
            className: "text-center",
            cell: (b) => {
                const e = getExecution(b)
                if (!e) return <Dash />
                return <StatusBadge status={e.status} />
            },
        },
        {
            header: <InfoHint entry="executionDuration">{t("columns.duration")}</InfoHint>,
            className: "text-right",
            cell: (b) => {
                const e = getExecution(b)
                return (e && getExecutionDuration(t, e)) ?? <Dash />
            },
        },
    ]
}
