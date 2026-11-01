import { Dash, orDash } from "@/components/dash"
import { type HintDetail, InfoHint } from "@/components/info-hint"
import { formatDay, formatPercent } from "@/lib/format"
import { rebalanceFrequencyLabels } from "./constants"
import { MetricBlock, type MetricRow } from "./metric-block"
import {
    benchmarkRecovery,
    benchmarkValue,
    type Metric,
    metricDefinitions,
    resultRecovery,
    resultValue,
} from "./metrics"
import type { BacktestResult, RebalanceFrequency } from "./types"
import { formatAmount, fromDecimal } from "./utils"

// Colonnes : le portefeuille puis, avec un benchmark, son symbole
const columnsOf = ({ benchmark }: BacktestResult) => (benchmark ? ["Portefeuille", benchmark.symbol] : ["Portefeuille"])

function metricRow(result: BacktestResult, metric: Metric, details?: HintDetail[]): MetricRow {
    const { label, hint } = metricDefinitions[metric]
    const { benchmark } = result
    const values = [resultValue(result, metric), ...(benchmark ? [benchmarkValue(benchmark, metric)] : [])]
    return { label, hint, details, values }
}

function recoveryRow({ benchmark, ...result }: BacktestResult): MetricRow {
    return {
        label: "Récupération",
        hint: "recovery",
        values: [resultRecovery(result), ...(benchmark ? [benchmarkRecovery(benchmark)] : [])],
    }
}

// Note du bloc Performance en DCA : valeur d'un investissement unique et écart avec le DCA
function LumpSumNote({ lumpSum }: { lumpSum: NonNullable<BacktestResult["lumpSumComparison"]> }) {
    const { finalValue, dcaAdvantage } = lumpSum
    return (
        <>
            <InfoHint
                entry="lumpSum"
                details={[
                    { label: "Investissement unique", value: formatAmount(finalValue) },
                    { label: "Écart du DCA", value: formatAmount(dcaAdvantage) },
                ]}
            >
                Investi en une fois au 1er jour
            </InfoHint>
            {` : ${formatAmount(finalValue)}, soit ${formatAmount(Math.abs(dcaAdvantage))} de ${dcaAdvantage >= 0 ? "moins" : "mieux"} que le DCA`}
        </>
    )
}

function PerformanceBlock({ result }: { result: BacktestResult }) {
    const { lumpSumComparison } = result
    return (
        <MetricBlock
            title="Performance"
            description="Rendement, hors versements"
            columns={columnsOf(result)}
            rows={[metricRow(result, "cagr"), metricRow(result, "totalReturn"), metricRow(result, "finalValue")]}
            note={lumpSumComparison && <LumpSumNote lumpSum={lumpSumComparison} />}
        />
    )
}

function RiskBlock({ result }: { result: BacktestResult }) {
    const { maxDrawdownDate, maxDrawdownPeakDate } = result
    const riskFreeRate = fromDecimal(result.riskFreeRate)
    const troughDetails = maxDrawdownDate ? [{ label: "Creux atteint le", value: formatDay(maxDrawdownDate) }] : []

    return (
        <MetricBlock
            title="Risque"
            description={
                riskFreeRate == null ? "Annualisé" : `Annualisé, taux sans risque ${formatPercent(riskFreeRate)}`
            }
            columns={columnsOf(result)}
            rows={[
                metricRow(result, "volatility"),
                metricRow(result, "sharpeRatio"),
                metricRow(result, "maxDrawdown", troughDetails),
                recoveryRow(result),
            ]}
            note={maxDrawdownPeakDate && `Baisse maximale depuis le plus haut du ${formatDay(maxDrawdownPeakDate)}`}
        />
    )
}

function CostsBlock({ result, rebalanceFrequency }: ResultMetricsProps) {
    const rebalancing =
        rebalanceFrequency === "NONE"
            ? "Sans rebalancement"
            : `Rebalancement ${rebalanceFrequencyLabels[rebalanceFrequency].toLowerCase()}`

    return (
        <MetricBlock
            title="Coûts et activité"
            description={`${rebalancing} · frais déduits de la valeur, achats et ventes`}
            columns={["Total"]}
            rows={[
                {
                    label: "Frais payés",
                    hint: "totalFees",
                    values: [orDash(fromDecimal(result.totalFees), formatAmount)],
                },
                { label: "Ordres", hint: "totalTrades", values: [result.totalTrades] },
                { label: "Rebalancements", hint: "rebalanceCount", values: [result.rebalanceCount ?? <Dash />] },
            ]}
        />
    )
}

interface ResultMetricsProps {
    result: BacktestResult
    rebalanceFrequency: RebalanceFrequency
}

/**
 * Indicateurs d'un résultat en trois blocs (performance, risque, coûts et activité), tous calculés par le moteur :
 * le front ne fait que les formater. Avec un benchmark, une seconde colonne affiche ses métriques.
 * Un champ absent d'un résultat antérieur (`cagr` null, D10) s'affiche `<Dash />`.
 */
export function ResultMetrics({ result, rebalanceFrequency }: ResultMetricsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <PerformanceBlock result={result} />
            <RiskBlock result={result} />
            <CostsBlock result={result} rebalanceFrequency={rebalanceFrequency} />
        </div>
    )
}
