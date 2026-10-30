"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import PageHeader from "@/components/page-layout/header"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PAGE_SIZE } from "@/constants/pagination"
import { formatDayRange, formatRate } from "@/lib/format"
import { paginate } from "@/lib/pagination"
import { tradeColumns } from "./column"
import { rebalanceFrequencyLabels, statusBadges, strategyLabels } from "./constants"
import { useBacktest, useRerunBacktest } from "./hook"
import { ResultDetails } from "./result-details"
import { ResultOverview } from "./result-overview"
import { BacktestResultBlocks } from "./stats"
import type { BacktestDetails } from "./types"
import { getExecution, getExecutionDuration, isActive } from "./utils"

// Ordres affichés avant « Voir les N ordres » : les plus récents
const RECENT_TRADES = 5

function describe(backtest: BacktestDetails) {
    const e = getExecution(backtest)
    const duration = e?.status === "COMPLETED" && getExecutionDuration(e)
    return [
        strategyLabels[backtest.investmentMode],
        backtest.allocations.map(({ symbol, weight }) => `${formatRate(Number(weight))} ${symbol}`).join(" · "),
        backtest.rebalanceFrequency !== "NONE" && `rebalancement ${rebalanceFrequencyLabels[backtest.rebalanceFrequency].toLowerCase()}`,
        backtest.benchmarkSymbol && `benchmark ${backtest.benchmarkSymbol}`,
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

/**
 * Écran de détail d'un backtest (maquette 13 v2 · A) : en-tête et relance, valeur finale avec courbes de valeur et de drawdown,
 * indicateurs groupés, derniers ordres (tous, paginés, à la demande), puis positions, hypothèses et historique repliés.
 * Rafraîchi tant qu'une exécution est active.
 */
export function BacktestDetail({ id }: { id: string }) {
    const query = useBacktest(id)
    const rerun = useRerunBacktest(id)
    const [tradePage, setTradePage] = useState(1)
    const [allTrades, setAllTrades] = useState(false)
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
                badge={execution && <Badge variant={statusBadges[execution.status].variant}>{statusBadges[execution.status].label}</Badge>}
                description={describe(backtest)}
                actions={<Button onClick={() => rerun.mutate()} disabled={!canRerun}>Relancer</Button>}
            />

            {result ? (
                <>
                    <ResultOverview result={result} />
                    <BacktestResultBlocks result={result} rebalanceFrequency={backtest.rebalanceFrequency} />
                    <DataTable
                        rows={allTrades
                            ? paginate(result.trades.toReversed(), tradePage, PAGE_SIZE)
                            : result.trades.slice(-RECENT_TRADES).toReversed()}
                        columns={tradeColumns}
                        rowKey={(t) => `${t.date}-${t.symbol}-${t.side}-${t.amount}`}
                        title="Ordres"
                        description={allTrades
                            ? "Achats et ventes, du plus récent au plus ancien"
                            : `${Math.min(RECENT_TRADES, result.trades.length)} plus récents sur ${result.trades.length}`}
                        actions={result.trades.length > RECENT_TRADES && (
                            <Button variant="outline" size="sm" onClick={() => setAllTrades(!allTrades)}>
                                {allTrades ? "Afficher les plus récents" : `Voir les ${result.trades.length} ordres`}
                            </Button>
                        )}
                        emptyMessage="Aucun ordre."
                        pagination={allTrades
                            ? { page: tradePage, pageSize: PAGE_SIZE, count: result.trades.length, onPageChange: setTradePage }
                            : undefined}
                    />
                </>
            ) : (
                <NoResult backtest={backtest} />
            )}

            <ResultDetails backtest={backtest} />
        </>
    )
}
