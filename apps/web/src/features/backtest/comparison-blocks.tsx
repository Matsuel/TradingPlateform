import type { ReactNode } from "react"
import Dash from "@/components/custom/Dash"
import { Badge } from "@/components/ui/badge"
import { LOCALE, formatChange, formatDayRange, formatPercent, formatRate, formatRatio, formatSharpe } from "@/lib/format"
import { cn } from "@/lib/utils"
import { comparedMetricHigherIsBetter, NO_BENCHMARK_LABEL, rebalanceFrequencyLabels, strategyLabels } from "./constants"
import { MetricBlock } from "./metric-block"
import type { BacktestComparison, ComparedBacktest, ComparedMetric, ComparisonParameter } from "./types"
import { comparisonLabel, formatAmount, formatRecovery, fromDecimal, getComparisonBenchmark, show } from "./utils"

// Écart en points de ratio (0.044 → « +4,4 pts »)
const formatPointChange = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "always" }).format
const formatPoints = (ratio: number) => `${formatPointChange(ratio * 100)} pts`

// Écart A − B de l'API, vert s'il est favorable à A, rouge sinon
function Delta({ metric, value, format }: { metric: ComparedMetric; value: number | null; format: (v: number) => string }) {
    if (value == null) return <Dash />
    const favorable = value === 0 ? null : value > 0 === comparedMetricHigherIsBetter[metric]
    return <span className={cn(favorable === true && "text-green-600", favorable === false && "text-destructive")}>{format(value)}</span>
}

/**
 * Tableau « Métriques comparées » (maquette 19 v2) : A, B, écart A − B calculé par le backend (`deltas`) et, si A (sinon
 * B) a un benchmark, ses métriques. Récupération et valeur finale n'ont pas d'écart. `<Dash />` pour une valeur absente.
 */
export function ComparisonMetrics({ comparison }: { comparison: BacktestComparison }) {
    const { a, b, deltas } = comparison
    const { benchmark } = getComparisonBenchmark(comparison)
    const columns = [comparisonLabel("A", a.name), comparisonLabel("B", b.name), "Écart", ...(benchmark ? [benchmark.symbol] : [])]
    // Valeur de A, de B, écart puis, avec un benchmark, la sienne
    const row = (label: string, value: (r: ComparedBacktest["result"]) => ReactNode, delta: ReactNode, benchmarkValue: ReactNode) => ({
        label,
        values: [value(a.result), value(b.result), delta, ...(benchmark ? [benchmarkValue] : [])],
    })

    return (
        <MetricBlock
            title="Métriques comparées"
            description="Écart = A − B, en points (Sharpe sans unité)"
            rowHeader="Indicateur"
            columns={columns}
            strong={2}
            rows={[
                row("CAGR", (r) => show(fromDecimal(r.cagr), formatRatio), <Delta metric="cagr" value={deltas.cagr} format={formatPoints} />, benchmark && show(benchmark.cagr, formatRatio)),
                row("Rendement total", (r) => show(fromDecimal(r.totalReturn), formatRatio), <Delta metric="totalReturn" value={deltas.totalReturn} format={formatPoints} />, benchmark && formatRatio(benchmark.totalReturn)),
                row("Volatilité", (r) => show(fromDecimal(r.volatility), formatPercent), <Delta metric="volatility" value={deltas.volatility} format={formatPoints} />, benchmark && show(benchmark.volatility, formatPercent)),
                row("Sharpe", (r) => show(fromDecimal(r.sharpeRatio), formatSharpe), <Delta metric="sharpeRatio" value={deltas.sharpeRatio} format={formatChange} />, benchmark && show(benchmark.sharpeRatio, formatSharpe)),
                row("Max drawdown", (r) => show(fromDecimal(r.maxDrawdown), formatRatio), <Delta metric="maxDrawdown" value={deltas.maxDrawdown} format={formatPoints} />, benchmark && formatRatio(benchmark.maxDrawdown)),
                row("Récupération", (r) => formatRecovery(r.recoveryDays, fromDecimal(r.maxDrawdown)), <Dash />, benchmark && formatRecovery(benchmark.recoveryDays, benchmark.maxDrawdown)),
                row("Valeur finale", (r) => show(fromDecimal(r.finalValue), formatAmount), <Dash />, benchmark && formatAmount(benchmark.finalValue)),
            ]}
        />
    )
}

/**
 * Tableau « Paramètres » (maquette 19 v2) : période, mode, allocation, rebalancement, frais et benchmark de A et B ;
 * badge « diffère » sur les paramètres que le backend signale dans `differences`.
 */
export function ComparisonParameters({ comparison }: { comparison: BacktestComparison }) {
    const { a, b, differences } = comparison
    const row = (label: string, value: (backtest: ComparedBacktest) => ReactNode, parameter?: ComparisonParameter) => ({
        label,
        badge: parameter && differences.includes(parameter) && <Badge variant="outline">diffère</Badge>,
        values: [value(a), value(b)],
    })

    return (
        <MetricBlock
            title="Paramètres"
            description="Ceux qui diffèrent sont signalés"
            rowHeader="Paramètre"
            columns={["A", "B"]}
            strong={0}
            rows={[
                row("Période", (t) => formatDayRange(t.startDate, t.endDate), "period"),
                row("Mode", (t) => strategyLabels[t.investmentMode]),
                row("Allocation", (t) => t.allocations.map(({ symbol, weight }) => <div key={symbol}>{symbol} {formatRate(Number(weight))}</div>)),
                row("Rebalancement", (t) => rebalanceFrequencyLabels[t.rebalanceFrequency]),
                row("Frais", (t) => formatPercent(Number(t.feeRate)), "feeRate"),
                row("Benchmark", (t) => t.benchmarkSymbol ?? NO_BENCHMARK_LABEL, "benchmarkSymbol"),
            ]}
        />
    )
}
