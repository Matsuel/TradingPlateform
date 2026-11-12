"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Dash } from "@/components/dash"
import { EmptyCard } from "@/components/empty-card"
import { InfoHint } from "@/components/info-hint"
import { PageHeader } from "@/components/page-layout"
import { ErrorState, LoadingState } from "@/components/query-status"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { useApiErrorMessages } from "@/lib/api-error"
import { useFormatters } from "@/lib/format"
import { routes } from "@/lib/routes"
import { trendOf } from "@/lib/trend"
import { DividendValueChart } from "./dividend-value-chart"
import { DividendsTable } from "./dividends-table"
import { useBacktest } from "./hook"
import { ReturnBreakdownCard } from "./return-breakdown"
import { StatusBadge } from "./status-badge"
import type { BacktestResult } from "./types"
import { formatAmount, fromDecimal, getExecution, hasDividendDetails } from "./utils"

// Quatre cartes : valeur finale, rendement total (avec le cours seul), dividendes perçus, effet de change (hors EUR seulement)
function DividendStats({ result }: { result: BacktestResult }) {
    const f = useFormatters()
    const t = useTranslations("backtest.dividends")
    const finalValue = fromDecimal(result.finalValue)
    const invested = fromDecimal(result.totalInvested)
    const totalReturn = fromDecimal(result.totalReturn)
    const priceReturn = fromDecimal(result.priceReturn)
    const dividendTotal = fromDecimal(result.dividendTotal)
    const { returnBreakdown } = result
    const points = (ratio: number) => t("points", { value: f.formatChange(ratio * 100) })

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label={<InfoHint entry="finalValue">{t("finalValue")}</InfoHint>}
                value={finalValue == null ? <Dash /> : formatAmount(f, finalValue)}
                delta={totalReturn == null ? undefined : f.formatRatio(totalReturn)}
                trend={trendOf(totalReturn ?? 0)}
                caption={invested == null ? undefined : t("invested", { amount: formatAmount(f, invested) })}
            />
            <StatCard
                label={<InfoHint entry="totalReturn">{t("totalReturn")}</InfoHint>}
                value={totalReturn == null ? <Dash /> : f.formatRatio(totalReturn)}
                delta={returnBreakdown && points(returnBreakdown.dividends)}
                trend={trendOf(returnBreakdown?.dividends ?? 0)}
                caption={
                    priceReturn == null ? undefined : (
                        <InfoHint entry="priceReturn">{t("priceOnly", { value: f.formatRatio(priceReturn) })}</InfoHint>
                    )
                }
            />
            <StatCard
                label={<InfoHint entry="dividendTotal">{t("dividendTotal")}</InfoHint>}
                value={dividendTotal == null ? <Dash /> : formatAmount(f, dividendTotal)}
                delta={t("reinvested")}
                caption={t("dividendCaption")}
            />
            {returnBreakdown?.fx != null && (
                <StatCard
                    label={<InfoHint entry="fxContribution">{t("fx")}</InfoHint>}
                    value={points(returnBreakdown.fx)}
                    trend={trendOf(returnBreakdown.fx)}
                    caption={t("fxCaption", { value: f.formatRatio(returnBreakdown.local) })}
                />
            )}
        </div>
    )
}

/**
 * Écran « Dividendes et change » d'un backtest (maquette 31), ouvert depuis le détail : quatre cartes de rendement,
 * décomposition du rendement, courbe avec et sans dividendes, tableau des dividendes perçus. Valeurs du moteur affichées
 * telles quelles ; un résultat antérieur (sans ces champs) ou sans dividende ni change n'a rien à détailler.
 */
export function BacktestDividends({ id }: { id: string }) {
    const t = useTranslations("backtest.dividends")
    const { errorMessage } = useApiErrorMessages()
    const { data: backtest, isPending, isError, error, refetch } = useBacktest(id)

    if (isPending) return <LoadingState className="h-64" />
    if (isError) return <ErrorState message={errorMessage(error)} onRetry={refetch} className="h-64" />

    const execution = getExecution(backtest)
    const { result } = backtest
    const back = (
        <Button variant="outline" render={<Link href={routes.backtest(id)} />}>
            {t("back")}
        </Button>
    )

    return (
        <>
            <PageHeader
                title={backtest.name}
                badge={execution && <StatusBadge status={execution.status} />}
                description={t("description")}
                actions={back}
            />
            {result?.returnBreakdown && hasDividendDetails(result) ? (
                <>
                    <DividendStats result={result} />
                    <div className="grid gap-4 lg:grid-cols-2">
                        <ReturnBreakdownCard
                            breakdown={result.returnBreakdown}
                            totalReturn={fromDecimal(result.totalReturn) ?? 0}
                        />
                        <DividendValueChart result={result} />
                    </div>
                    {result.dividendEvents && result.dividendEvents.length > 0 && (
                        <DividendsTable events={result.dividendEvents} total={result.dividendTotal ?? null} />
                    )}
                </>
            ) : (
                <EmptyCard>{t("empty")}</EmptyCard>
            )}
        </>
    )
}
