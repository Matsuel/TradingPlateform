"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { EmptyCard } from "@/components/empty-card"
import { PageHeader } from "@/components/page-layout"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Button } from "@/components/ui/button"
import { useApiErrorMessages } from "@/lib/api-error"
import { type Formatters, useFormatters } from "@/lib/format"
import { routes } from "@/lib/routes"
import { useBacktest, useRerunBacktest } from "./hook"
import { ResultDetails } from "./result/result-details"
import { ResultMetrics } from "./result/result-metrics"
import { ResultOverview } from "./result/result-overview"
import { TradesTable } from "./result/trades-table"
import { StatusBadge } from "./status-badge"
import type { BacktestDetails } from "./types"
import {
    type BacktestTranslator,
    executionErrorLabel,
    formatAllocation,
    getExecution,
    getExecutionDuration,
    isActive,
} from "./utils"

function describe(f: Formatters, t: BacktestTranslator, backtest: BacktestDetails) {
    const e = getExecution(backtest)
    const duration = e?.status === "COMPLETED" && getExecutionDuration(t, e)
    return [
        t(`strategy.${backtest.investmentMode}`),
        formatAllocation(f, backtest.allocations),
        backtest.rebalanceFrequency !== "NONE" &&
            t("detail.rebalancing", {
                frequency: t(`rebalanceFrequency.${backtest.rebalanceFrequency}`).toLowerCase(),
            }),
        backtest.benchmarkSymbol && t("detail.benchmark", { symbol: backtest.benchmarkSymbol }),
        f.formatDayRange(backtest.startDate, backtest.endDate),
        duration && t("detail.executedIn", { duration }),
    ]
        .filter(Boolean)
        .join(" · ")
}

function NoResult({ backtest }: { backtest: BacktestDetails }) {
    const t = useTranslations("backtest.detail")
    const tBacktest = useTranslations("backtest")
    const e = getExecution(backtest)
    const message =
        e?.status === "FAILED"
            ? t("failed", { error: executionErrorLabel(tBacktest, e, t("unknownError")) })
            : t("pending")

    return <EmptyCard>{message}</EmptyCard>
}

type DetailActionsProps = {
    dividendsHref?: string | null | false // absent sans résultat
    batchHref?: string | null // lot de robustesse d'origine
    onRerun: () => void
    canRerun: boolean
}

function DetailActions({ dividendsHref, batchHref, onRerun, canRerun }: DetailActionsProps) {
    const t = useTranslations("backtest.detail")

    return (
        <>
            {dividendsHref && (
                <Button variant="outline" nativeButton={false} render={<Link href={dividendsHref} />}>
                    {t("dividends")}
                </Button>
            )}
            {batchHref && (
                <Button variant="outline" nativeButton={false} render={<Link href={batchHref} />}>
                    {t("robustness")}
                </Button>
            )}
            <Button onClick={onRerun} disabled={!canRerun}>
                {t("rerun")}
            </Button>
        </>
    )
}

/**
 * Écran de détail d'un backtest (maquette 13) : en-tête et relance, valeur finale avec courbes de valeur et de drawdown,
 * indicateurs groupés, derniers ordres (tous, paginés, à la demande), puis positions, hypothèses et historique repliés.
 * Rafraîchi tant qu'une exécution est active.
 */
export function BacktestDetail({ id }: { id: string }) {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const { errorMessage } = useApiErrorMessages()
    const query = useBacktest(id)
    const rerun = useRerunBacktest(id)
    const { data: backtest, isPending, isError, error, refetch } = query

    if (isPending) return <LoadingState className="h-64" />

    if (isError) return <ErrorState message={errorMessage(error)} onRetry={refetch} className="h-64" />

    const execution = getExecution(backtest)
    const { result } = backtest
    // Une seule exécution active à la fois : le backend refuse la relance (409)
    const canRerun = !rerun.isPending && !(execution && isActive(execution))

    return (
        <>
            <PageHeader
                title={backtest.name}
                badge={execution && <StatusBadge status={execution.status} />}
                description={describe(f, t, backtest)}
                actions={
                    <DetailActions
                        dividendsHref={result && routes.backtestDividends(id)}
                        batchHref={backtest.batchId && routes.backtestBatch(backtest.batchId)}
                        onRerun={() => rerun.mutate()}
                        canRerun={canRerun}
                    />
                }
            />

            {result ? (
                <>
                    <ResultOverview result={result} />
                    <ResultMetrics result={result} rebalanceFrequency={backtest.rebalanceFrequency} />
                    <TradesTable trades={result.trades} />
                </>
            ) : (
                <NoResult backtest={backtest} />
            )}

            <ResultDetails backtest={backtest} />
        </>
    )
}
