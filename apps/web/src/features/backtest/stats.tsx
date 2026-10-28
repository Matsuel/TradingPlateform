import { StatCard } from "@/components/stat-card"
import type { Backtest, ExecutionStatus } from "./types"
import { hasStatus } from "./utils"

export function BacktestStats({ backtests }: { backtests: Backtest[] }) {
    const count = (...statuses: ExecutionStatus[]) => backtests.filter((b) => hasStatus(b, statuses)).length
    const total = backtests.length
    const rate = (n: number) => `${total ? Math.round((n / total) * 100) : 0} %`
    const completed = count("COMPLETED")
    const failed = count("FAILED")

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Backtests au total" value={total} caption="Depuis la création" />
            <StatCard label="En cours" value={count("PENDING", "RUNNING")} caption="Workflows actifs" />
            <StatCard label="Terminés" value={completed} caption="Taux de réussite" delta={rate(completed)} trend="up" />
            <StatCard label="Échoués" value={failed} caption="Runs en erreur" delta={rate(failed)} trend="down" />
        </div>
    )
}
