import type { ReactNode } from "react"
import Dash from "@/components/custom/Dash"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDayRange, formatPercent } from "@/lib/format"
import {
    BACKTEST_CURRENCY,
    BACKTEST_DISCLAIMER,
    NO_BENCHMARK_LABEL,
    RISK_FREE_RATE,
    dataProviderLabels,
    executionRuleLabels,
    priceTypeLabels,
    rebalanceFrequencyLabels,
} from "./constants"
import type { Backtest, BacktestResult } from "./types"

// Préfixe de l'empreinte SHA-256, assez long pour distinguer deux jeux de données à l'œil
const FINGERPRINT_PREVIEW_LENGTH = 12

function Assumption({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-start gap-4">
            <dt className="flex-1 text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}

/**
 * Carte « Hypothèses » d'un résultat : période, devise, frais, rebalancement, benchmark (« Aucun » sans), taux sans risque du Sharpe, règle d'exécution et provenance des cours,
 * suivie de l'avertissement. Règle et source absentes des résultats antérieurs : `<Dash />`.
 */
export function BacktestAssumptions({ backtest, result }: { backtest: Backtest; result: BacktestResult }) {
    const { executionRule, dataSource } = result

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Hypothèses</CardTitle>
                <CardDescription className="text-small">Conditions de la simulation</CardDescription>
            </CardHeader>
            <CardContent>
                <dl className="grid gap-2 text-sm">
                    <Assumption label="Période">{formatDayRange(backtest.startDate, backtest.endDate)}</Assumption>
                    <Assumption label="Devise">{BACKTEST_CURRENCY}</Assumption>
                    <Assumption label="Frais">{formatPercent(Number(backtest.feeRate))} par achat</Assumption>
                    <Assumption label="Rebalancement">{rebalanceFrequencyLabels[backtest.rebalanceFrequency]}</Assumption>
                    <Assumption label="Benchmark">{backtest.benchmarkSymbol ?? NO_BENCHMARK_LABEL}</Assumption>
                    <Assumption label="Taux sans risque">{formatPercent(RISK_FREE_RATE)}</Assumption>
                    <Assumption label="Règle d’exécution">
                        {executionRule ? executionRuleLabels[executionRule] : <Dash />}
                    </Assumption>
                    <Assumption label="Source des données">
                        {dataSource
                            ? `${dataProviderLabels[dataSource.provider]} · ${priceTypeLabels[dataSource.priceType]}`
                            : <Dash />}
                    </Assumption>
                    <Assumption label="Données récupérées le">
                        {dataSource ? formatDate(dataSource.fetchedAt) : <Dash />}
                    </Assumption>
                    <Assumption label="Empreinte des données">
                        {dataSource
                            ? <span className="font-mono" title={dataSource.fingerprint}>{dataSource.fingerprint.slice(0, FINGERPRINT_PREVIEW_LENGTH)}</span>
                            : <Dash />}
                    </Assumption>
                </dl>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">{BACKTEST_DISCLAIMER}</p>
            </CardFooter>
        </Card>
    )
}
