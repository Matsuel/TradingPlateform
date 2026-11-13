import { useTranslations } from "next-intl"
import { Dash, orDash } from "@/components/dash"
import { DetailRow } from "@/components/detail-row"
import { useFormatters } from "@/lib/format"
import { BACKTEST_CURRENCY, dataProviderLabels } from "../constants"
import type { Backtest, BacktestResult } from "../types"
import { fromDecimal } from "../utils"

// Préfixe de l'empreinte SHA-256, assez long pour distinguer deux jeux de données à l'œil
const FINGERPRINT_PREVIEW_LENGTH = 12

/**
 * Hypothèses d'un résultat, en deux colonnes à partir de `sm` : période, devise, frais, rebalancement, benchmark (« Aucun » sans), taux sans risque du Sharpe, règle d'exécution et provenance des cours,
 * suivie de l'avertissement. Taux sans risque, règle et source absents des résultats antérieurs : `<Dash />`.
 */
export function BacktestAssumptions({ backtest, result }: { backtest: Backtest; result: BacktestResult }) {
    const { formatDate, formatDayRange, formatPercent } = useFormatters()
    const t = useTranslations("backtest")
    const { executionRule, dataSource } = result

    return (
        <div className="flex flex-col gap-3">
            <dl className="grid gap-x-12 text-body sm:grid-cols-2">
                <DetailRow divided label={t("assumptions.period")}>
                    {formatDayRange(backtest.startDate, backtest.endDate)}
                </DetailRow>
                <DetailRow divided label={t("assumptions.currency")}>
                    {BACKTEST_CURRENCY}
                </DetailRow>
                <DetailRow divided label={t("assumptions.fees")} hint="feeRate">
                    {t("assumptions.feesValue", { rate: formatPercent(Number(backtest.feeRate)) })}
                </DetailRow>
                <DetailRow divided label={t("assumptions.rebalancing")} hint="rebalanceFrequency">
                    {t(`rebalanceFrequency.${backtest.rebalanceFrequency}`)}
                </DetailRow>
                <DetailRow divided label={t("assumptions.benchmark")} hint="benchmark">
                    {backtest.benchmarkSymbol ?? t("noBenchmark")}
                </DetailRow>
                <DetailRow divided label={t("assumptions.riskFree")} hint="riskFreeRate">
                    {orDash(fromDecimal(result.riskFreeRate), formatPercent)}
                </DetailRow>
                <DetailRow divided label={t("assumptions.executionRule")} hint="executionRule">
                    {executionRule ? t(`executionRule.${executionRule}`) : <Dash />}
                </DetailRow>
                <DetailRow divided label={t("assumptions.dataSource")} hint="dataSource">
                    {dataSource ? (
                        `${dataProviderLabels[dataSource.provider]} · ${t(`priceType.${dataSource.priceType}`)}`
                    ) : (
                        <Dash />
                    )}
                </DetailRow>
                <DetailRow divided label={t("assumptions.fetchedAt")}>
                    {dataSource ? formatDate(dataSource.fetchedAt) : <Dash />}
                </DetailRow>
                <DetailRow divided label={t("assumptions.fingerprint")} hint="dataFingerprint">
                    {dataSource ? (
                        <span className="font-mono" title={dataSource.fingerprint}>
                            {dataSource.fingerprint.slice(0, FINGERPRINT_PREVIEW_LENGTH)}
                        </span>
                    ) : (
                        <Dash />
                    )}
                </DetailRow>
            </dl>
            <p className="text-small text-muted-foreground">{t("disclaimer")}</p>
        </div>
    )
}
