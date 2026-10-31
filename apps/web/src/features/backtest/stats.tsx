import type { ReactNode } from "react"
import Dash from "@/components/custom/Dash"
import { StatCard } from "@/components/stat-card"
import { formatDay, formatPercent, formatRate, formatRatio, formatSharpe } from "@/lib/format"
import { RISK_FREE_RATE, rebalanceFrequencyLabels } from "./constants"
import { MetricBlock } from "./metric-block"
import type { BacktestListStats, BacktestResult, RebalanceFrequency } from "./types"
import { formatAmount, formatRecovery, fromDecimal, show } from "./utils"

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
 * Indicateurs d'un résultat en trois blocs (performance, risque, coûts et activité), tous calculés par le moteur :
 * le front ne fait que les formater. Avec un benchmark, une seconde colonne affiche ses métriques.
 * Un champ absent d'un résultat antérieur (`cagr` null, D10) s'affiche `<Dash />`.
 */
export function BacktestResultBlocks({
    result,
    rebalanceFrequency,
}: {
    result: BacktestResult
    rebalanceFrequency: RebalanceFrequency
}) {
    const { benchmark, lumpSumComparison: lumpSum, maxDrawdownPeakDate } = result
    const maxDrawdown = fromDecimal(result.maxDrawdown)
    const columns = benchmark ? ["Portefeuille", benchmark.symbol] : ["Portefeuille"]
    // Valeur du portefeuille puis, avec un benchmark, la sienne
    const row = (label: string, value: ReactNode, benchmarkValue?: ReactNode) => ({
        label,
        values: benchmark ? [value, benchmarkValue] : [value],
    })
    const rebalancing = rebalanceFrequency === "NONE" ? "Sans rebalancement" : `Rebalancement ${rebalanceFrequencyLabels[rebalanceFrequency].toLowerCase()}`

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricBlock
                title="Performance"
                description="Rendement, hors versements"
                columns={columns}
                rows={[
                    row("CAGR", show(fromDecimal(result.cagr), formatRatio), benchmark && show(benchmark.cagr, formatRatio)),
                    row("Rendement total", show(fromDecimal(result.totalReturn), formatRatio), benchmark && formatRatio(benchmark.totalReturn)),
                    row("Valeur finale", show(fromDecimal(result.finalValue), formatAmount), benchmark && formatAmount(benchmark.finalValue)),
                ]}
                note={lumpSum && `Investi en une fois au 1er jour : ${formatAmount(lumpSum.finalValue)}, soit ${formatAmount(Math.abs(lumpSum.dcaAdvantage))} de ${lumpSum.dcaAdvantage >= 0 ? "moins" : "mieux"} que le DCA`}
            />
            <MetricBlock
                title="Risque"
                description={`Annualisé, taux sans risque ${formatPercent(RISK_FREE_RATE)}`}
                columns={columns}
                rows={[
                    row("Volatilité", show(fromDecimal(result.volatility), formatPercent), benchmark && show(benchmark.volatility, formatPercent)),
                    row("Sharpe", show(fromDecimal(result.sharpeRatio), formatSharpe), benchmark && show(benchmark.sharpeRatio, formatSharpe)),
                    row("Max drawdown", show(maxDrawdown, formatRatio), benchmark && formatRatio(benchmark.maxDrawdown)),
                    row("Récupération", formatRecovery(result.recoveryDays, maxDrawdown), benchmark && formatRecovery(benchmark.recoveryDays, benchmark.maxDrawdown)),
                ]}
                note={maxDrawdownPeakDate && `Baisse maximale depuis le plus haut du ${formatDay(maxDrawdownPeakDate)}`}
            />
            <MetricBlock
                title="Coûts et activité"
                description={`${rebalancing} · frais inclus dans le montant investi`}
                columns={["Total"]}
                rows={[
                    { label: "Frais payés", values: [show(fromDecimal(result.totalFees), formatAmount)] },
                    { label: "Ordres", values: [result.totalTrades] },
                    { label: "Rebalancements", values: [result.rebalanceCount ?? <Dash />] },
                ]}
            />
        </div>
    )
}
