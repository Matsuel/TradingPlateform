import { Dash, orDash } from "@/components/dash"
import { DetailRow } from "@/components/detail-row"
import { formatDate, formatDayRange, formatPercent } from "@/lib/format"
import {
    BACKTEST_CURRENCY,
    BACKTEST_DISCLAIMER,
    dataProviderLabels,
    executionRuleLabels,
    NO_BENCHMARK_LABEL,
    priceTypeLabels,
    rebalanceFrequencyLabels,
} from "./constants"
import type { Backtest, BacktestResult } from "./types"
import { fromDecimal } from "./utils"

// Préfixe de l'empreinte SHA-256, assez long pour distinguer deux jeux de données à l'œil
const FINGERPRINT_PREVIEW_LENGTH = 12

/**
 * Hypothèses d'un résultat, en deux colonnes à partir de `sm` : période, devise, frais, rebalancement, benchmark (« Aucun » sans), taux sans risque du Sharpe, règle d'exécution et provenance des cours,
 * suivie de l'avertissement. Taux sans risque, règle et source absents des résultats antérieurs : `<Dash />`.
 */
export function BacktestAssumptions({ backtest, result }: { backtest: Backtest; result: BacktestResult }) {
    const { executionRule, dataSource } = result

    return (
        <div className="flex flex-col gap-3">
            <dl className="grid gap-x-12 text-body sm:grid-cols-2">
                <DetailRow divided label="Période">
                    {formatDayRange(backtest.startDate, backtest.endDate)}
                </DetailRow>
                <DetailRow divided label="Devise">
                    {BACKTEST_CURRENCY}
                </DetailRow>
                <DetailRow divided label="Frais" hint="feeRate">
                    {formatPercent(Number(backtest.feeRate))} par ordre, achat et vente
                </DetailRow>
                <DetailRow divided label="Rebalancement" hint="rebalanceFrequency">
                    {rebalanceFrequencyLabels[backtest.rebalanceFrequency]}
                </DetailRow>
                <DetailRow divided label="Benchmark" hint="benchmark">
                    {backtest.benchmarkSymbol ?? NO_BENCHMARK_LABEL}
                </DetailRow>
                <DetailRow divided label="Taux sans risque" hint="riskFreeRate">
                    {orDash(fromDecimal(result.riskFreeRate), formatPercent)}
                </DetailRow>
                <DetailRow divided label="Règle d’exécution" hint="executionRule">
                    {executionRule ? executionRuleLabels[executionRule] : <Dash />}
                </DetailRow>
                <DetailRow divided label="Source des données" hint="dataSource">
                    {dataSource ? (
                        `${dataProviderLabels[dataSource.provider]} · ${priceTypeLabels[dataSource.priceType]}`
                    ) : (
                        <Dash />
                    )}
                </DetailRow>
                <DetailRow divided label="Données récupérées le">
                    {dataSource ? formatDate(dataSource.fetchedAt) : <Dash />}
                </DetailRow>
                <DetailRow divided label="Empreinte des données" hint="dataFingerprint">
                    {dataSource ? (
                        <span className="font-mono" title={dataSource.fingerprint}>
                            {dataSource.fingerprint.slice(0, FINGERPRINT_PREVIEW_LENGTH)}
                        </span>
                    ) : (
                        <Dash />
                    )}
                </DetailRow>
            </dl>
            <p className="text-small text-muted-foreground">{BACKTEST_DISCLAIMER}</p>
        </div>
    )
}
