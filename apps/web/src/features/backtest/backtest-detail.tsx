"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import PageHeader from "@/components/page-layout/header"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PAGE_SIZE } from "@/constants/pagination"
import { formatDayRange } from "@/lib/format"
import { paginate } from "@/lib/pagination"
import { tradeColumns } from "./column"
import { statusBadges, strategyLabels } from "./constants"
import { EquityChart } from "./equity-chart"
import { ExecutionHistory } from "./execution-history"
import { useBacktest, useRerunBacktest } from "./hook"
import { BacktestResultStats } from "./stats"
import type { BacktestDetails } from "./types"
import { getExecution, getExecutionDuration, isActive } from "./utils"

function describe(backtest: BacktestDetails) {
    const e = getExecution(backtest)
    const duration = e?.status === "COMPLETED" && getExecutionDuration(e)
    return [
        strategyLabels[backtest.investmentMode],
        formatDayRange(backtest.startDate, backtest.endDate),
        duration && `exécuté en ${duration}`,
    ].filter(Boolean).join(" · ")
}

function NoResult({ backtest }: { backtest: BacktestDetails }) {
    const e = getExecution(backtest)
    const message = e?.status === "FAILED"
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

export function BacktestDetail({ id }: { id: string }) {
    const query = useBacktest(id)
    const rerun = useRerunBacktest(id)
    const [tradePage, setTradePage] = useState(1)
    const { data: backtest, isPending, isError, error, refetch } = query

    if (isPending) return <LoadingState className="h-64" />

    if (isError) return <ErrorState message={error.message} onRetry={refetch} className="h-64" />

    const execution = getExecution(backtest)
    const { result } = backtest
    // Une seule exécution active à la fois : le backend refuse la relance (409)
    const canRerun = !rerun.isPending && !(execution && isActive(execution))

    return (
        <>
            <div className="flex flex-col gap-3">
                <PageHeader
                    title={backtest.name}
                    badge={execution && <Badge variant={statusBadges[execution.status].variant}>{statusBadges[execution.status].label}</Badge>}
                    description={describe(backtest)}
                    actions={<Button onClick={() => rerun.mutate()} disabled={!canRerun}>Relancer</Button>}
                />
                <div className="flex flex-wrap items-center gap-2">
                    {backtest.symbols.map((symbol) => (
                        <Badge key={symbol} variant="outline" className="h-auto py-1 px-2 text-xs">{symbol}</Badge>
                    ))}
                </div>
            </div>

            {result ? (
                <>
                    <BacktestResultStats result={result} />
                    <EquityChart data={result.equityCurve} positive={Number(result.totalReturn) >= 0} />
                    <DataTable
                        query={{ ...query, data: paginate(result.trades.toReversed(), tradePage, PAGE_SIZE) }}
                        columns={tradeColumns}
                        rowKey={(t) => `${t.date}-${t.symbol}`}
                        title="Ordres"
                        description="Achats exécutés, du plus récent au plus ancien"
                        emptyMessage="Aucun ordre."
                        pagination={{ page: tradePage, pageSize: PAGE_SIZE, count: result.trades.length, onPageChange: setTradePage }}
                    />
                </>
            ) : (
                <NoResult backtest={backtest} />
            )}

            <ExecutionHistory
                executions={backtest.executions}
                actions={
                    <Button variant="outline" onClick={() => rerun.mutate()} disabled={!canRerun}>
                        Relancer ce backtest
                    </Button>
                }
            />
        </>
    )
}
