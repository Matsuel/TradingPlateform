import Dash from "@/components/custom/Dash"
import { StatCard } from "@/components/stat-card"
import { formatChange, formatDay, formatPrice } from "@/lib/format"
import { BACKTEST_CURRENCY } from "./constants"
import type { Backtest, BacktestResult, ExecutionStatus } from "./types"
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
            <StatCard label="En cours" value={count("PENDING", "RUNNING")} caption="Backtests actifs" />
            <StatCard label="Terminés" value={completed} caption="Taux de réussite" delta={rate(completed)} trend="up" />
            <StatCard label="Échoués" value={failed} caption="Runs en erreur" delta={rate(failed)} trend="down" />
        </div>
    )
}

// Métriques d'un résultat : toutes calculées par le moteur, le front ne fait que les formater
export function BacktestResultStats({ result }: { result: BacktestResult }) {
    const totalReturn = Number(result.totalReturn) * 100
    const finalValue = Number(result.finalValue)
    const invested = result.totalInvested == null ? null : Number(result.totalInvested)

    return (
        <div className="grid grid-cols-3 gap-4">
            <StatCard
                label="Rendement total"
                value={`${formatChange(totalReturn)} %`}
                trend={totalReturn >= 0 ? "up" : "down"}
                caption={invested != null && `Plus-value : ${formatPrice(finalValue - invested, BACKTEST_CURRENCY)}`}
            />
            <StatCard
                label="Drawdown max"
                value={result.maxDrawdown == null ? <Dash /> : `${formatChange(Number(result.maxDrawdown) * 100)} %`}
                caption={result.maxDrawdownDate ? `Le ${formatDay(result.maxDrawdownDate)}` : result.maxDrawdown != null && "Aucune baisse"}
            />
            <StatCard
                label="Valeur finale"
                value={formatPrice(finalValue, BACKTEST_CURRENCY)}
                delta={`${result.totalTrades} ordres`}
                caption={invested != null && `${formatPrice(invested, BACKTEST_CURRENCY)} investis`}
            />
        </div>
    )
}
