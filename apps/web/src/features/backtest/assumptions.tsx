import type { ReactNode } from "react"
import Dash from "@/components/custom/Dash"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LOCALE, formatDate, formatDayRange } from "@/lib/format"
import {
    BACKTEST_CURRENCY,
    BACKTEST_DISCLAIMER,
    dataProviderLabels,
    executionRuleLabels,
    priceTypeLabels,
} from "./constants"
import type { Backtest, BacktestResult } from "./types"

// Taux en fraction affiché sans signe, jusqu'à 2 décimales (0,001 → 0,1 %) : formatRate arrondit à l'unité
const formatFeeRate = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 2 }).format

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
 * Carte « Hypothèses » d'un résultat : période, devise, frais, règle d'exécution et provenance des cours,
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
                    <Assumption label="Frais">{formatFeeRate(Number(backtest.feeRate))} par achat</Assumption>
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
