"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/data-table/data-table"
import { FilterTabs } from "@/components/filter-tabs"
import { backtestColumns } from "./column"
import { statusFilters, type StatusFilter } from "./constants"
import { useBacktests } from "./hook"
import { BacktestStats } from "./stats"
import { hasStatus } from "./utils"
import { prefix } from "@/lib/path"

const filterOptions = (Object.keys(statusFilters) as StatusFilter[]).map((value) => ({ value, label: statusFilters[value].label }))

export function BacktestList() {
    const query = useBacktests()
    const router = useRouter()
    const [filter, setFilter] = useState<StatusFilter>("all")

    const { statuses } = statusFilters[filter]
    const data = statuses.length ? query.data?.filter((b) => hasStatus(b, statuses)) : query.data

    return (
        <>
            <BacktestStats backtests={query.data ?? []} />

            <DataTable
                query={{ ...query, data }}
                columns={backtestColumns}
                rowKey={(b) => b.id}
                onRowClick={(b) => router.push(`${prefix}/backtest/${b.id}`)}
                title="Tous les backtests"
                description="Triés par date de lancement"
                actions={<FilterTabs value={filter} onChange={setFilter} options={filterOptions} />}
                emptyMessage="Aucun backtest."
            />
        </>
    )
}
