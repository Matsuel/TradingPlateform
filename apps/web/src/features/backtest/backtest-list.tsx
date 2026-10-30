"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import { FilterTabs } from "@/components/filter-tabs"
import { PAGE_SIZE } from "@/constants/pagination"
import { backtestColumns } from "./column"
import { statusFilters, type StatusFilter } from "./constants"
import { useBacktests, useBacktestStats } from "./hook"
import { BacktestStats } from "./stats"
import { prefix } from "@/lib/path"

const filterOptions = (Object.keys(statusFilters) as StatusFilter[]).map((value) => ({ value, label: statusFilters[value].label }))

export function BacktestList() {
    const router = useRouter()
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

            <DataTable
                query={{ ...query, data: query.data?.data }}
                columns={backtestColumns}
                rowKey={(b) => b.id}
                onRowClick={(b) => router.push(`${prefix}/backtest/${b.id}`)}
                title="Tous les backtests"
                description="Triés par date de lancement"
                actions={<FilterTabs value={filter} onChange={changeFilter} options={filterOptions} />}
                emptyMessage="Aucun backtest."
                pagination={{ page, pageSize: PAGE_SIZE, count: query.data?.count ?? 0, onPageChange: setPage }}
            />
        </>
    )
}
