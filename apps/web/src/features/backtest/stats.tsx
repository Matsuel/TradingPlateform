import type { ReactNode } from "react"
import Dash from "@/components/custom/Dash"
import { InfoHint } from "@/components/info-hint"
import { StatCard } from "@/components/stat-card"
import type { GlossaryKey } from "@/constants/glossary"
import { formatDay, formatPercent, formatRate, formatRatio, formatSharpe } from "@/lib/format"
import { rebalanceFrequencyLabels } from "./constants"
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
                caption={<InfoHint entry="completedRate" value={stats && formatRate(stats.completedRate)}>Taux de réussite</InfoHint>}
                delta={stats && formatRate(stats.completedRate)}
                trend="up"
            />
            <StatCard
                label="Échoués"
                value={stats?.failed ?? <Dash />}
                caption={<InfoHint entry="failedRate" value={stats && formatRate(stats.failedRate)}>Runs en erreur</InfoHint>}
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
    const riskFreeRate = fromDecimal(result.riskFreeRate)
    const columns = benchmark ? ["Portefeuille", benchmark.symbol] : ["Portefeuille"]
    // Libellé cliquable, valeur du portefeuille puis, avec un benchmark, la sienne
    const row = (entry: GlossaryKey, label: string, value: ReactNode, benchmarkValue?: ReactNode) => ({
        label: <InfoHint entry={entry} value={value}>{label}</InfoHint>,
        values: benchmark ? [value, benchmarkValue] : [value],
    })
    const total = (entry: GlossaryKey, label: string, value: ReactNode) => ({ label: <InfoHint entry={entry} value={value}>{label}</InfoHint>, values: [value] })
    const rebalancing = rebalanceFrequency === "NONE" ? "Sans rebalancement" : `Rebalancement ${rebalanceFrequencyLabels[rebalanceFrequency].toLowerCase()}`

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricBlock
                title="Performance"
                description="Rendement, hors versements"
                columns={columns}
                rows={[
                    row("cagr", "CAGR", show(fromDecimal(result.cagr), formatRatio), benchmark && show(benchmark.cagr, formatRatio)),
                    row("totalReturn", "Rendement total", show(fromDecimal(result.totalReturn), formatRatio), benchmark && formatRatio(benchmark.totalReturn)),
                    row("finalValue", "Valeur finale", show(fromDecimal(result.finalValue), formatAmount), benchmark && formatAmount(benchmark.finalValue)),
                ]}
                note={lumpSum && (
                    <>
                        <InfoHint entry="lumpSum" value={formatAmount(lumpSum.dcaAdvantage)}>Investi en une fois au 1er jour</InfoHint>
                        {` : ${formatAmount(lumpSum.finalValue)}, soit ${formatAmount(Math.abs(lumpSum.dcaAdvantage))} de ${lumpSum.dcaAdvantage >= 0 ? "moins" : "mieux"} que le DCA`}
                    </>
                )}
            />
            <MetricBlock
                title="Risque"
                description={riskFreeRate == null ? "Annualisé" : `Annualisé, taux sans risque ${formatPercent(riskFreeRate)}`}
                columns={columns}
                rows={[
                    row("volatility", "Volatilité", show(fromDecimal(result.volatility), formatPercent), benchmark && show(benchmark.volatility, formatPercent)),
                    row("sharpeRatio", "Sharpe", show(fromDecimal(result.sharpeRatio), formatSharpe), benchmark && show(benchmark.sharpeRatio, formatSharpe)),
                    row("maxDrawdown", "Max drawdown", show(maxDrawdown, formatRatio), benchmark && formatRatio(benchmark.maxDrawdown)),
                    row("recovery", "Récupération", formatRecovery(result.recoveryDays, maxDrawdown, maxDrawdownPeakDate != null), benchmark && formatRecovery(benchmark.recoveryDays, benchmark.maxDrawdown, true)),
                ]}
                note={maxDrawdownPeakDate && `Baisse maximale depuis le plus haut du ${formatDay(maxDrawdownPeakDate)}`}
            />
            <MetricBlock
                title="Coûts et activité"
                description={`${rebalancing} · frais déduits de la valeur, achats et ventes`}
                columns={["Total"]}
                rows={[
                    total("totalFees", "Frais payés", show(fromDecimal(result.totalFees), formatAmount)),
                    total("totalTrades", "Ordres", result.totalTrades),
                    total("rebalanceCount", "Rebalancements", result.rebalanceCount ?? <Dash />),
                ]}
            />
        </div>
    )
}
