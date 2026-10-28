"use client"

import { Loader2 } from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import PageHeader from "@/components/page-layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDayRange } from "@/lib/format"
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
        backtest.symbols.join(", "),
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
    const { data: backtest, isPending, isError, error, refetch } = query

    if (isPending) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
                <p className="text-sm text-destructive">{error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
            </div>
        )
    }

    const execution = getExecution(backtest)
    const { result } = backtest
    // Une seule exécution active à la fois : le backend refuse la relance (409)
    const canRerun = !rerun.isPending && !(execution && isActive(execution))

    return (
        <>
            <PageHeader
                title={backtest.name}
                badge={execution && <Badge variant={statusBadges[execution.status].variant}>{statusBadges[execution.status].label}</Badge>}
                description={describe(backtest)}
                actions={<Button onClick={() => rerun.mutate()} disabled={!canRerun}>Relancer</Button>}
            />

            {result ? (
                <>
                    <BacktestResultStats result={result} />
                    <EquityChart data={result.equityCurve} positive={Number(result.totalReturn) >= 0} />
                    <DataTable
                        query={{ ...query, data: result.trades.toReversed() }}
                        columns={tradeColumns}
                        rowKey={(t) => `${t.date}-${t.symbol}`}
                        title="Ordres"
                        description="Achats exécutés, du plus récent au plus ancien"
                        emptyMessage="Aucun ordre."
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
