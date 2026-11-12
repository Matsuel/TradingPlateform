"use client"

import { useTranslations } from "next-intl"
import { EmptyCard } from "@/components/empty-card"
import { PageHeader } from "@/components/page-layout"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Button } from "@/components/ui/button"
import { useApiErrorMessages } from "@/lib/api-error"
import { type Formatters, useFormatters } from "@/lib/format"
import { useBacktest, useRerunBacktest } from "./hook"
import { ResultDetails } from "./result-details"
import { ResultMetrics } from "./result-metrics"
import { ResultOverview } from "./result-overview"
import { StatusBadge } from "./status-badge"
import { TradesTable } from "./trades-table"
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
                    <Button onClick={() => rerun.mutate()} disabled={!canRerun}>
                        {t("detail.rerun")}
                    </Button>
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
