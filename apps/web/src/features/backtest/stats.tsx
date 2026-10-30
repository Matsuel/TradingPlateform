import Dash from "@/components/custom/Dash"
import { StatCard } from "@/components/stat-card"
import { formatDay, formatPrice, formatRate, formatRatio } from "@/lib/format"
import { BACKTEST_CURRENCY } from "./constants"
import type { BacktestListStats, BacktestResult, LumpSumComparison } from "./types"
import { fromDecimal } from "./utils"

/** Compteurs et taux de la liste, calculés par le backend ; `stats` undefined pendant le chargement. */
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

/**
 * Métriques d'un résultat, toutes calculées par le moteur : le front ne fait que les formater.
 * Un champ absent d'un résultat antérieur s'affiche `<Dash />` ou masque sa légende.
 */
export function BacktestResultStats({ result }: { result: BacktestResult }) {
    const totalReturn = fromDecimal(result.totalReturn)
    const finalValue = fromDecimal(result.finalValue)
    const invested = fromDecimal(result.totalInvested)
    const profit = fromDecimal(result.profit)
    const maxDrawdown = fromDecimal(result.maxDrawdown)
    const fees = fromDecimal(result.totalFees)

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
                label="Rendement total"
                value={totalReturn == null ? <Dash /> : formatRatio(totalReturn)}
                caption={profit != null && `Plus-value : ${formatPrice(profit, BACKTEST_CURRENCY)}`}
            />
            <StatCard
                label="Drawdown max"
                value={maxDrawdown == null ? <Dash /> : formatRatio(maxDrawdown)}
                caption={result.maxDrawdownDate ? `Le ${formatDay(result.maxDrawdownDate)}` : maxDrawdown != null && "Aucune baisse"}
            />
            <StatCard
                label="Valeur finale"
                value={finalValue == null ? <Dash /> : formatPrice(finalValue, BACKTEST_CURRENCY)}
                delta={`${result.totalTrades} ordres`}
                caption={invested != null && `${formatPrice(invested, BACKTEST_CURRENCY)} investis`}
            />
            <StatCard
                label="Frais payés"
                value={fees == null ? <Dash /> : formatPrice(fees, BACKTEST_CURRENCY)}
                caption="Inclus dans le montant investi"
            />
        </div>
    )
}

/**
 * DCA face au même total investi en une fois au premier jour (backtests DCA uniquement).
 * L'écart `dcaAdvantage` est calculé par le moteur : > 0 si le DCA fait mieux.
 */
export function LumpSumComparisonStats({ comparison }: { comparison: LumpSumComparison }) {
    const { finalValue, totalReturn, maxDrawdown, dcaAdvantage } = comparison

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
                label="Investissement unique"
                value={formatPrice(finalValue, BACKTEST_CURRENCY)}
                delta={formatRatio(totalReturn)}
                trend={totalReturn >= 0 ? "up" : "down"}
                caption={`Même total investi au premier jour · drawdown max ${formatRatio(maxDrawdown)}`}
            />
            <StatCard
                label="Écart du DCA"
                value={formatPrice(dcaAdvantage, BACKTEST_CURRENCY)}
                caption={dcaAdvantage >= 0 ? "Le DCA fait mieux que l’investissement unique" : "L’investissement unique fait mieux que le DCA"}
            />
        </div>
    )
}
