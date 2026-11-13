"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { TableCard } from "@/components/data-table/table-card"
import { EmptyCard } from "@/components/empty-card"
import { PageHeader } from "@/components/page-layout"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { useApiErrorMessages } from "@/lib/api-error"
import { useFormatters } from "@/lib/format"
import { routes } from "@/lib/routes"
import { BatchStats } from "./batch-stats"
import { useBatchColumns } from "./column"
import { MIN_START_DATES } from "./constants"
import { useBacktestBatch, useRerunBacktestBatch, useRestartBacktestBatch } from "./hook"
import { RollingWindows } from "./rolling-windows"
import { StartDates } from "./start-dates"
import { StatusBadge } from "./status-badge"
import type { BacktestBatch } from "./types"
import { isActiveStatus, startDateIssue } from "./utils"

const STARTS_ID = "batch-starts"

// Carte « Dates de départ » : les départs du lot, modifiables ; « Lancer le lot » crée un nouveau lot à ces dates
function StartsCard({ batch }: { batch: BacktestBatch }) {
    const t = useTranslations("backtest.batch.starts")
    const router = useRouter()
    const { errorMessage } = useApiErrorMessages()
    const restart = useRestartBacktestBatch(batch.batchId)
    const [dates, setDates] = useState<(Date | undefined)[]>(() => batch.rows.map((row) => new Date(row.startDate)))
    const end = new Date(batch.endDate)
    const valid = dates.length >= MIN_START_DATES && dates.every((_, i) => startDateIssue(dates, i, end) === null)

    const launch = async () => {
        const created = await restart.mutateAsync(dates as Date[])
        router.push(routes.backtestBatch(created.batchId))
    }

    return (
        <Card id={STARTS_ID}>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                <StartDates
                    dates={dates}
                    onChange={setDates}
                    end={end}
                    action={
                        <Button onClick={launch} disabled={!valid || restart.isPending}>
                            {t("launch", { count: dates.length })}
                        </Button>
                    }
                />
                {restart.error && <FieldError>{errorMessage(restart.error)}</FieldError>}
            </CardContent>
        </Card>
    )
}

/**
 * Page d'un lot de départs (maquette 32) : synthèse, résultats par date de départ, dates de départ modifiables et fenêtres
 * glissantes du départ le plus ancien. Valeurs telles que reçues de `GET /api/backtest/batch/:batchId`, rafraîchies tant
 * qu'un départ est actif ; « Relancer le lot » relance chaque départ.
 */
export function BacktestBatchView({ batchId }: { batchId: string }) {
    const f = useFormatters()
    const t = useTranslations("backtest.batch")
    const { errorMessage } = useApiErrorMessages()
    const { data: batch, isPending, isError, error, refetch } = useBacktestBatch(batchId)
    const rerun = useRerunBacktestBatch(batchId)
    const router = useRouter()
    const columns = useBatchColumns(batch?.endDate ?? "")

    if (isPending) return <LoadingState className="h-64" />
    if (isError) return <ErrorState message={errorMessage(error)} onRetry={refetch} className="h-64" />

    return (
        <>
            <PageHeader
                title={t("title", { name: batch.name })}
                badge={<StatusBadge status={batch.status} />}
                description={t("description", { count: batch.rows.length, end: f.formatDay(batch.endDate) })}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => document.getElementById(STARTS_ID)?.scrollIntoView({ behavior: "smooth" })}
                        >
                            {t("editStarts")}
                        </Button>
                        <Button
                            onClick={() => rerun.mutate()}
                            disabled={rerun.isPending || isActiveStatus(batch.status)}
                        >
                            {t("rerun")}
                        </Button>
                    </>
                }
            />
            <BatchStats batch={batch} />
            <TableCard title={t("results.title")} description={t("results.description")}>
                <DataTable
                    rows={batch.rows}
                    columns={columns}
                    rowKey={(row) => row.backtestId}
                    onRowClick={(row) => router.push(routes.backtest(row.backtestId))}
                    emptyMessage={t("results.empty")}
                />
                <p className="text-small text-muted-foreground">{t("results.note")}</p>
            </TableCard>
            <div className="grid items-start gap-4 lg:grid-cols-2">
                <StartsCard key={batch.batchId} batch={batch} />
                {batch.rollingSummary && batch.rollingSummary.length > 0 ? (
                    <RollingWindows windows={batch.rollingSummary} />
                ) : (
                    <EmptyCard>{t("rolling.empty")}</EmptyCard>
                )}
            </div>
        </>
    )
}
