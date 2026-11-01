"use client"

import { PageHeader } from "@/components/page-layout"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDayRange } from "@/lib/format"
import { rebalanceFrequencyLabels, strategyLabels } from "./constants"
import { useBacktest, useRerunBacktest } from "./hook"
import { ResultDetails } from "./result-details"
import { ResultMetrics } from "./result-metrics"
import { ResultOverview } from "./result-overview"
import { StatusBadge } from "./status-badge"
import { TradesTable } from "./trades-table"
import type { BacktestDetails } from "./types"
import { formatAllocation, getExecution, getExecutionDuration, isActive } from "./utils"

function describe(backtest: BacktestDetails) {
    const e = getExecution(backtest)
    const duration = e?.status === "COMPLETED" && getExecutionDuration(e)
    return [
        strategyLabels[backtest.investmentMode],
        formatAllocation(backtest.allocations),
        backtest.rebalanceFrequency !== "NONE" &&
            `rebalancement ${rebalanceFrequencyLabels[backtest.rebalanceFrequency].toLowerCase()}`,
        backtest.benchmarkSymbol && `benchmark ${backtest.benchmarkSymbol}`,
        formatDayRange(backtest.startDate, backtest.endDate),
        duration && `exécuté en ${duration}`,
    ]
        .filter(Boolean)
        .join(" · ")
}

function NoResult({ backtest }: { backtest: BacktestDetails }) {
    const e = getExecution(backtest)
    const message =
        e?.status === "FAILED"
            ? `Le backtest a échoué : ${e.error ?? "erreur inconnue"}`
            : "Les résultats s’afficheront à la fin du calcul."

    return (
        <Card>
            <CardContent className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                {message}
            </CardContent>
        </Card>
    )
}

/**
 * Écran de détail d'un backtest (maquette 13) : en-tête et relance, valeur finale avec courbes de valeur et de drawdown,
 * indicateurs groupés, derniers ordres (tous, paginés, à la demande), puis positions, hypothèses et historique repliés.
 * Rafraîchi tant qu'une exécution est active.
 */
export function BacktestDetail({ id }: { id: string }) {
    const query = useBacktest(id)
    const rerun = useRerunBacktest(id)
    const { data: backtest, isPending, isError, error, refetch } = query

    if (isPending) return <LoadingState className="h-64" />

    if (isError) return <ErrorState message={error.message} onRetry={refetch} className="h-64" />

    const execution = getExecution(backtest)
    const { result } = backtest
    // Une seule exécution active à la fois : le backend refuse la relance (409)
    const canRerun = !rerun.isPending && !(execution && isActive(execution))

    return (
        <>
            <PageHeader
                title={backtest.name}
                badge={execution && <StatusBadge status={execution.status} />}
                description={describe(backtest)}
                actions={
                    <Button onClick={() => rerun.mutate()} disabled={!canRerun}>
                        Relancer
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
