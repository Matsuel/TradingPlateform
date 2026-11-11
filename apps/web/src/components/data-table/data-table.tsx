"use client"

import type { UseQueryResult } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { TablePagination, type TablePaginationProps } from "./table-pagination"

export type Column<T> = {
    header: ReactNode
    cell: (row: T) => ReactNode
    className?: string
}

type QueryState<T> = Pick<UseQueryResult<T[], Error>, "data" | "isPending" | "isError" | "error"> & {
    refetch: () => unknown
}

// Lignes issues d'une requête (états chargement / erreur affichés) ou déjà chargées (rows)
type DataTableSource<T> = { query: QueryState<T>; rows?: never } | { rows: T[]; query?: never }

type DataTableProps<T> = DataTableSource<T> & {
    columns: Column<T>[]
    rowKey: (row: T) => string
    onRowClick?: (row: T) => void
    emptyMessage?: ReactNode
    pagination?: TablePaginationProps // page courante (à partir de 1) et count total, toutes pages confondues
}

// Ligne pleine largeur d'un état (chargement, erreur, vide) à la place des lignes de données
function StatusRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
    return (
        <TableRow variant="plain">
            <TableCell colSpan={colSpan} className="h-64">
                <div className="flex flex-col items-center justify-center gap-3 text-center">{children}</div>
            </TableCell>
        </TableRow>
    )
}

function DataRows<T>({
    rows,
    columns,
    rowKey,
    onRowClick,
}: Pick<DataTableProps<T>, "columns" | "rowKey" | "onRowClick"> & { rows: T[] }) {
    return rows.map((row) => (
        <TableRow
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(onRowClick && "cursor-pointer")}
        >
            {columns.map((col, i) => (
                <TableCell key={i} className={col.className}>
                    {col.cell(row)}
                </TableCell>
            ))}
        </TableRow>
    ))
}

/**
 * Tableau générique : lignes d'une requête (`query`, avec états chargement / erreur / vide) ou déjà chargées (`rows`),
 * colonnes déclarées dans `features/<domaine>/column.tsx`, pagination optionnelle. Cadre et titre : `TableCard`.
 */
export function DataTable<T>({
    query,
    rows,
    columns,
    rowKey,
    onRowClick,
    emptyMessage,
    pagination,
}: DataTableProps<T>) {
    const t = useTranslations("components.dataTable")
    const { data, isPending, isError, error, refetch } = query ?? {
        data: rows,
        isPending: false,
        isError: false,
        error: null,
        refetch: () => undefined,
    }
    const span = columns.length

    let body: ReactNode
    if (isPending)
        body = (
            <StatusRow colSpan={span}>
                <LoadingState />
            </StatusRow>
        )
    else if (isError)
        body = (
            <StatusRow colSpan={span}>
                <ErrorState message={error?.message} onRetry={refetch} />
            </StatusRow>
        )
    else if (!data?.length)
        body = (
            <StatusRow colSpan={span}>
                <span className="text-body text-muted-foreground">{emptyMessage ?? t("empty")}</span>
            </StatusRow>
        )
    else body = <DataRows rows={data} columns={columns} rowKey={rowKey} onRowClick={onRowClick} />

    return (
        <div className="flex flex-col gap-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col, i) => (
                            <TableHead key={i} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>{body}</TableBody>
            </Table>
            {pagination && <TablePagination {...pagination} />}
        </div>
    )
}
