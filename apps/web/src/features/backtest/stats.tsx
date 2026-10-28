import Dash from "@/components/custom/Dash"
import { StatCard } from "@/components/stat-card"
import { formatDay, formatPrice, formatRate, formatRatio } from "@/lib/format"
import { BACKTEST_CURRENCY } from "./constants"
import type { BacktestListStats, BacktestResult } from "./types"

// Compteurs et taux calculés par le backend ; undefined pendant le chargement
export function BacktestStats({ stats }: { stats: BacktestListStats | undefined }) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Backtests au total" value={stats?.total ?? <Dash />} caption="Depuis la création" />
            <StatCard label="En cours" value={stats?.active ?? <Dash />} caption="Backtests actifs" />
            <StatCard
                label="Terminés"
                value={stats?.completed ?? <Dash />}
                caption="Taux de réussite"
                delta={stats && formatRate(stats.completedRate)}
                trend="up"
            />
            <StatCard
                label="Échoués"
                value={stats?.failed ?? <Dash />}
                caption="Runs en erreur"
                delta={stats && formatRate(stats.failedRate)}
                trend="down"
            />
        </div>
    )
}

// Métriques d'un résultat : toutes calculées par le moteur, le front ne fait que les formater
export function BacktestResultStats({ result }: { result: BacktestResult }) {
    const totalReturn = Number(result.totalReturn)
    const finalValue = Number(result.finalValue)
    const invested = result.totalInvested == null ? null : Number(result.totalInvested)

    return (
        <div className="grid grid-cols-3 gap-4">
            <StatCard
                label="Rendement total"
                value={formatRatio(totalReturn)}
                trend={totalReturn >= 0 ? "up" : "down"}
                caption={invested != null && `Plus-value : ${formatPrice(finalValue - invested, BACKTEST_CURRENCY)}`}
            />
            <StatCard
                label="Drawdown max"
                value={result.maxDrawdown == null ? <Dash /> : formatRatio(Number(result.maxDrawdown))}
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
