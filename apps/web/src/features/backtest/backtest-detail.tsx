"use client"

import { Loader2 } from "lucide-react"
import Dash from "@/components/custom/Dash"
import { DataTable } from "@/components/data-table/data-table"
import PageHeader from "@/components/page-layout/header"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatChange, formatDay, formatPrice } from "@/lib/format"
import { tradeColumns } from "./column"
import { statusBadges, strategyLabels } from "./constants"
import { EquityChart } from "./equity-chart"
import { ExecutionHistory } from "./execution-history"
import { useBacktest, useRerunBacktest } from "./hook"
import type { BacktestDetails, BacktestResult } from "./types"
import { getExecution, getExecutionDuration } from "./utils"

function ResultStats({ result }: { result: BacktestResult }) {
    const totalReturn = Number(result.totalReturn) * 100
    const finalValue = Number(result.finalValue)
    const invested = result.equityCurve.at(-1)?.invested ?? 0

    return (
        <div className="grid grid-cols-3 gap-4">
            <StatCard
                label="Rendement total"
                value={`${formatChange(totalReturn)} %`}
                trend={totalReturn >= 0 ? "up" : "down"}
                caption={`Plus-value : ${formatPrice(finalValue - invested, "EUR")}`}
            />
            <StatCard
                label="Drawdown max"
                value={result.maxDrawdown == null ? <Dash /> : `${formatChange(Number(result.maxDrawdown) * 100)} %`}
                caption={result.maxDrawdownDate ? `Le ${formatDay(result.maxDrawdownDate)}` : result.maxDrawdown != null && "Aucune baisse"}
            />
            <StatCard
                label="Valeur finale"
                value={formatPrice(finalValue, "EUR")}
                delta={`${result.totalTrades} ordres`}
                caption={`${formatPrice(invested, "EUR")} investis`}
            />
        </div>
    )
}

function Results({ backtest }: { backtest: BacktestDetails }) {
    const { result } = backtest

    if (!result) {
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

    return (
        <>
            <ResultStats result={result} />
            <EquityChart data={result.equityCurve} positive={Number(result.totalReturn) >= 0} />
            <DataTable
                query={{ data: result.trades.toReversed(), isPending: false, isError: false, error: null, refetch: () => {} }}
                columns={tradeColumns}
                rowKey={(t) => `${t.date}-${t.symbol}`}
                title="Ordres"
                description="Achats exécutés, du plus récent au plus ancien"
                emptyMessage="Aucun ordre."
            />
        </>
    )
}

export function BacktestDetail({ id }: { id: string }) {
    const { data: backtest, isPending, isError, error, refetch } = useBacktest(id)
    const rerun = useRerunBacktest(id)

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
    const duration = execution?.status === "COMPLETED" ? getExecutionDuration(execution) : null
    const description = [
        strategyLabels[backtest.investmentMode],
        backtest.symbols.join(", "),
        `${formatDay(backtest.startDate)} – ${formatDay(backtest.endDate)}`,
        duration && `exécuté en ${duration}`,
    ].filter(Boolean).join(" · ")

    return (
        <>
            <PageHeader
                title={backtest.name}
                badge={execution && <Badge variant={statusBadges[execution.status].variant}>{statusBadges[execution.status].label}</Badge>}
                description={description}
                actions={<Button onClick={() => rerun.mutate()} disabled={rerun.isPending}>Relancer</Button>}
            />
            <Results backtest={backtest} />
            <ExecutionHistory backtestId={backtest.id} executions={backtest.executions} />
        </>
    )
}
