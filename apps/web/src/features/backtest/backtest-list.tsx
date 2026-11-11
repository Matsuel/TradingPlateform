"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { TableCard } from "@/components/data-table/table-card"
import { FilterTabs } from "@/components/filter-tabs"
import { PAGE_SIZE } from "@/constants/pagination"
import { routes } from "@/lib/routes"
import { useBacktestColumns } from "./column"
import { type StatusFilter, statusFilters } from "./constants"
import { useBacktestStats, useBacktests } from "./hook"
import { BacktestStats } from "./stats"

const filterOptions = (Object.keys(statusFilters) as StatusFilter[]).map((value) => ({
    value,
    label: statusFilters[value].label,
}))

export function BacktestList() {
    const router = useRouter()
    const columns = useBacktestColumns()
    const [filter, setFilter] = useState<StatusFilter>("all")
    const [page, setPage] = useState(1)
    const query = useBacktests({ page, pageSize: PAGE_SIZE, status: statusFilters[filter].statuses })
    const stats = useBacktestStats()

    const changeFilter = (value: StatusFilter) => {
        setFilter(value)
        setPage(1)
    }

    return (
        <>
            <BacktestStats stats={stats.data} />

            <TableCard
                title="Tous les backtests"
                description="Triés par date de lancement"
                actions={<FilterTabs value={filter} onChange={changeFilter} options={filterOptions} />}
            >
                <DataTable
                    query={{ ...query, data: query.data?.data }}
                    columns={columns}
                    rowKey={(b) => b.id}
                    onRowClick={(b) => router.push(routes.backtest(b.id))}
                    emptyMessage="Aucun backtest."
                    pagination={{ page, pageSize: PAGE_SIZE, count: query.data?.count ?? 0, onPageChange: setPage }}
                />
            </TableCard>
        </>
    )
}
