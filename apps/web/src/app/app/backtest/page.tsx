"use client"
import Link from 'next/link'
import { useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { FilterTabs } from '@/components/filter-tabs'
import PageLayout from '@/components/page-layout'
import PageHeader from '@/components/page-layout/header'
import { Button } from '@/components/ui/button'
import { backtestColumns, getExecution } from '@/features/backtest/column'
import { useBacktests } from '@/features/backtest/hook'
import { BacktestStats } from '@/features/backtest/stats'
import { prefix } from '@/lib/path'

const filters = {
    all: { label: "Tous", statuses: [] },
    running: { label: "En cours", statuses: ["PENDING", "RUNNING"] },
    done: { label: "Terminés", statuses: ["COMPLETED"] },
    failed: { label: "Échoués", statuses: ["FAILED"] },
} as const

type Filter = keyof typeof filters

const filterOptions = (Object.keys(filters) as Filter[]).map((value) => ({ value, label: filters[value].label }))

const BacktestPage = () => {
    const query = useBacktests()
    const [filter, setFilter] = useState<Filter>("all")

    const statuses: readonly string[] = filters[filter].statuses
    const data = statuses.length
        ? query.data?.filter((b) => statuses.includes(getExecution(b)?.status ?? ""))
        : query.data

    return (
        <PageLayout>
            <PageHeader
                title='Backtests'
                description='Historique des runs de stratégies exécutés.'
                actions={<Button nativeButton={false} render={<Link href={`${prefix}/backtest/new`} />}>Nouveau backtest</Button>}
            />

            <BacktestStats backtests={query.data ?? []} />

            <DataTable
                query={{ ...query, data }}
                columns={backtestColumns}
                rowKey={(b) => b.id}
                title="Tous les backtests"
                description="Triés par date de lancement"
                actions={<FilterTabs value={filter} onChange={setFilter} options={filterOptions} />}
                emptyMessage="Aucun backtest."
            />
        </PageLayout>
    )
}

export default BacktestPage
