import type { ReactNode } from "react"
import { Dash } from "@/components/dash"
import { InfoHint } from "@/components/info-hint"
import { StatCard } from "@/components/stat-card"
import { formatDay, formatPercent, formatRate, formatRatio, formatSharpe } from "@/lib/format"
import { rebalanceFrequencyLabels } from "./constants"
import { MetricBlock } from "./metric-block"
import type { BacktestListStats, BacktestResult, RebalanceFrequency } from "./types"
import { formatAmount, formatRecovery, fromDecimal, show } from "./utils"

/** Compteurs et taux de la liste, calculés par le backend ; `stats` undefined pendant le chargement. */
export function BacktestStats({ stats }: { stats: BacktestListStats | undefined }) {
    const completedRate = stats && formatRate(stats.completedRate)
    const failedRate = stats && formatRate(stats.failedRate)

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Backtests au total" value={stats?.total ?? <Dash />} caption="Depuis la création" />
            <StatCard label="En cours" value={stats?.active ?? <Dash />} caption="Backtests actifs" />
            <StatCard
                label="Terminés"
                value={stats?.completed ?? <Dash />}
                caption={
                    <InfoHint entry="completedRate" value={completedRate}>
                        Taux de réussite
                    </InfoHint>
                }
                delta={completedRate}
                trend="up"
            />
            <StatCard
                label="Échoués"
                value={stats?.failed ?? <Dash />}
                caption={
                    <InfoHint entry="failedRate" value={failedRate}>
                        Runs en erreur
                    </InfoHint>
                }
                delta={failedRate}
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
    const { benchmark, lumpSumComparison: lumpSum, maxDrawdownDate, maxDrawdownPeakDate } = result
    const maxDrawdown = fromDecimal(result.maxDrawdown)
    const riskFreeRate = fromDecimal(result.riskFreeRate)
    const columns = benchmark ? ["Portefeuille", benchmark.symbol] : ["Portefeuille"]
    // Valeur du portefeuille puis, avec un benchmark, la sienne
    const values = (value: ReactNode, benchmarkValue?: ReactNode) => (benchmark ? [value, benchmarkValue] : [value])
    const rebalancing =
        rebalanceFrequency === "NONE"
            ? "Sans rebalancement"
            : `Rebalancement ${rebalanceFrequencyLabels[rebalanceFrequency].toLowerCase()}`

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricBlock
                title="Performance"
                description="Rendement, hors versements"
                columns={columns}
                rows={[
                    {
                        label: "CAGR",
                        hint: "cagr",
                        values: values(
                            show(fromDecimal(result.cagr), formatRatio),
                            benchmark && show(benchmark.cagr, formatRatio),
                        ),
                    },
                    {
                        label: "Rendement total",
                        hint: "totalReturn",
                        values: values(
                            show(fromDecimal(result.totalReturn), formatRatio),
                            benchmark && formatRatio(benchmark.totalReturn),
                        ),
                    },
                    {
                        label: "Valeur finale",
                        hint: "finalValue",
                        values: values(
                            show(fromDecimal(result.finalValue), formatAmount),
                            benchmark && formatAmount(benchmark.finalValue),
                        ),
                    },
                ]}
                note={
                    lumpSum && (
                        <>
                            <InfoHint
                                entry="lumpSum"
                                details={[
                                    { label: "Investissement unique", value: formatAmount(lumpSum.finalValue) },
                                    { label: "Écart du DCA", value: formatAmount(lumpSum.dcaAdvantage) },
                                ]}
                            >
                                Investi en une fois au 1er jour
                            </InfoHint>
                            {` : ${formatAmount(lumpSum.finalValue)}, soit ${formatAmount(Math.abs(lumpSum.dcaAdvantage))} de ${lumpSum.dcaAdvantage >= 0 ? "moins" : "mieux"} que le DCA`}
                        </>
                    )
                }
            />
            <MetricBlock
                title="Risque"
                description={
                    riskFreeRate == null ? "Annualisé" : `Annualisé, taux sans risque ${formatPercent(riskFreeRate)}`
                }
                columns={columns}
                rows={[
                    {
                        label: "Volatilité",
                        hint: "volatility",
                        values: values(
                            show(fromDecimal(result.volatility), formatPercent),
                            benchmark && show(benchmark.volatility, formatPercent),
                        ),
                    },
                    {
                        label: "Sharpe",
                        hint: "sharpeRatio",
                        values: values(
                            show(fromDecimal(result.sharpeRatio), formatSharpe),
                            benchmark && show(benchmark.sharpeRatio, formatSharpe),
                        ),
                    },
                    {
                        label: "Max drawdown",
                        hint: "maxDrawdown",
                        details: maxDrawdownDate
                            ? [{ label: "Creux atteint le", value: formatDay(maxDrawdownDate) }]
                            : [],
                        values: values(show(maxDrawdown, formatRatio), benchmark && formatRatio(benchmark.maxDrawdown)),
                    },
                    {
                        label: "Récupération",
                        hint: "recovery",
                        values: values(
                            formatRecovery(result.recoveryDays, maxDrawdown, maxDrawdownPeakDate != null),
                            benchmark && formatRecovery(benchmark.recoveryDays, benchmark.maxDrawdown, true),
                        ),
                    },
                ]}
                note={maxDrawdownPeakDate && `Baisse maximale depuis le plus haut du ${formatDay(maxDrawdownPeakDate)}`}
            />
            <MetricBlock
                title="Coûts et activité"
                description={`${rebalancing} · frais déduits de la valeur, achats et ventes`}
                columns={["Total"]}
                rows={[
                    {
                        label: "Frais payés",
                        hint: "totalFees",
                        values: [show(fromDecimal(result.totalFees), formatAmount)],
                    },
                    { label: "Ordres", hint: "totalTrades", values: [result.totalTrades] },
                    { label: "Rebalancements", hint: "rebalanceCount", values: [result.rebalanceCount ?? <Dash />] },
                ]}
            />
        </div>
    )
}
