import { useTranslations } from "next-intl"
import { InfoHint } from "@/components/info-hint"
import { useFormatters } from "@/lib/format"
import { MetricBlock } from "./metric-block"
import { type Metric, metricRow, resultColumns } from "./metrics"
import { CostsBlock, RiskBlock } from "./result-blocks"
import type { BacktestResult, RebalanceFrequency } from "./types"
import { formatAmount } from "./utils"

// Lignes du bloc Performance, dans l'ordre de la maquette 13 v2
const performanceMetrics: Metric[] = ["cagr", "totalReturn", "finalValue"]

// Note du bloc Performance en DCA : valeur d'un investissement unique et écart avec le DCA
function LumpSumNote({ lumpSum }: { lumpSum: NonNullable<BacktestResult["lumpSumComparison"]> }) {
    const f = useFormatters()
    const t = useTranslations("backtest.result.lumpSum")
    const { finalValue, dcaAdvantage } = lumpSum
    return (
        <>
            <InfoHint
                entry="lumpSum"
                details={[
                    { label: t("single"), value: formatAmount(f, finalValue) },
                    { label: t("dcaGap"), value: formatAmount(f, dcaAdvantage) },
                ]}
            >
                {t("label")}
            </InfoHint>
            {` : ${t("summary", {
                final: formatAmount(f, finalValue),
                gap: formatAmount(f, Math.abs(dcaAdvantage)),
                direction: dcaAdvantage >= 0 ? "less" : "more",
            })}`}
        </>
    )
}

function PerformanceBlock({ result }: { result: BacktestResult }) {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const { lumpSumComparison } = result
    return (
        <MetricBlock
            title={t("result.performance.title")}
            description={t("result.performance.description")}
            columns={resultColumns(t, result)}
            rows={performanceMetrics.map((metric) => metricRow(f, t, result, metric))}
            note={lumpSumComparison && <LumpSumNote lumpSum={lumpSumComparison} />}
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
