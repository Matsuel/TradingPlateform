import type { ReactNode } from "react"
import { Dash } from "@/components/dash"
import { InfoHint } from "@/components/info-hint"
import type { GlossaryKey } from "@/constants/glossary"
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
import { fromDecimal, show } from "./utils"

// Préfixe de l'empreinte SHA-256, assez long pour distinguer deux jeux de données à l'œil
const FINGERPRINT_PREVIEW_LENGTH = 12

function Assumption({ label, hint, children }: { label: string; hint?: GlossaryKey; children: ReactNode }) {
    return (
        <div className="flex items-start gap-4 border-b py-2">
            <dt className="flex-1 text-muted-foreground">
                <InfoHint entry={hint}>{label}</InfoHint>
            </dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}

/**
 * Hypothèses d'un résultat, en deux colonnes à partir de `sm` : période, devise, frais, rebalancement, benchmark (« Aucun » sans), taux sans risque du Sharpe, règle d'exécution et provenance des cours,
 * suivie de l'avertissement. Taux sans risque, règle et source absents des résultats antérieurs : `<Dash />`.
 */
export function BacktestAssumptions({ backtest, result }: { backtest: Backtest; result: BacktestResult }) {
    const { executionRule, dataSource } = result

    return (
        <div className="flex flex-col gap-3">
            <dl className="grid gap-x-12 text-sm sm:grid-cols-2">
                <Assumption label="Période">{formatDayRange(backtest.startDate, backtest.endDate)}</Assumption>
                <Assumption label="Devise">{BACKTEST_CURRENCY}</Assumption>
                <Assumption label="Frais" hint="feeRate">
                    {formatPercent(Number(backtest.feeRate))} par ordre, achat et vente
                </Assumption>
                <Assumption label="Rebalancement" hint="rebalanceFrequency">
                    {rebalanceFrequencyLabels[backtest.rebalanceFrequency]}
                </Assumption>
                <Assumption label="Benchmark" hint="benchmark">
                    {backtest.benchmarkSymbol ?? NO_BENCHMARK_LABEL}
                </Assumption>
                <Assumption label="Taux sans risque" hint="riskFreeRate">
                    {show(fromDecimal(result.riskFreeRate), formatPercent)}
                </Assumption>
                <Assumption label="Règle d’exécution" hint="executionRule">
                    {executionRule ? executionRuleLabels[executionRule] : <Dash />}
                </Assumption>
                <Assumption label="Source des données" hint="dataSource">
                    {dataSource ? (
                        `${dataProviderLabels[dataSource.provider]} · ${priceTypeLabels[dataSource.priceType]}`
                    ) : (
                        <Dash />
                    )}
                </Assumption>
                <Assumption label="Données récupérées le">
                    {dataSource ? formatDate(dataSource.fetchedAt) : <Dash />}
                </Assumption>
                <Assumption label="Empreinte des données" hint="dataFingerprint">
                    {dataSource ? (
                        <span className="font-mono" title={dataSource.fingerprint}>
                            {dataSource.fingerprint.slice(0, FINGERPRINT_PREVIEW_LENGTH)}
                        </span>
                    ) : (
                        <Dash />
                    )}
                </Assumption>
            </dl>
            <p className="text-xs text-muted-foreground">{BACKTEST_DISCLAIMER}</p>
        </div>
    )
}
