"use client"

import type { MouseEvent, ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { ErrorState, LoadingState } from "@/components/query-status"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPageItems } from "@/lib/pagination"
import { cn } from "@/lib/utils"

export type Column<T> = {
    header: ReactNode
    cell: (row: T) => ReactNode
    className?: string
}

type DataTableProps<T> = {
    query: Pick<UseQueryResult<T[], Error>, "data" | "isPending" | "isError" | "error"> & { refetch: () => unknown }
    columns: Column<T>[]
    rowKey: (row: T) => string
    onRowClick?: (row: T) => void
    emptyMessage?: ReactNode
    loader?: ReactNode
    title?: ReactNode
    description?: ReactNode
    actions?: ReactNode // ex. onglets de filtre, à droite du titre
    className?: string
    pagination?: TablePaginationProps // page courante (à partir de 1) et count total, toutes pages confondues
}

type TablePaginationProps = {
    page: number
    pageSize: number
    count: number
    onPageChange: (page: number) => void
}

function TablePagination({ page, pageSize, count, onPageChange }: TablePaginationProps) {
    const pageCount = Math.ceil(count / pageSize)
    if (pageCount <= 1) return null

    const select = (target: number) => (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        onPageChange(target)
    }
    const bound = (disabled: boolean) => ({
        "aria-disabled": disabled,
        tabIndex: disabled ? -1 : undefined,
        className: cn(disabled && "pointer-events-none opacity-50"),
    })

    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-small text-muted-foreground">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, count)} sur {count}
            </span>
            <Pagination className="mx-0 w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            text="Précédent"
                            aria-label="Page précédente"
                            onClick={select(page - 1)}
                            {...bound(page <= 1)}
                        />
                    </PaginationItem>
                    {getPageItems(page, pageCount).map((item, i) => (
                        <PaginationItem key={item === "ellipsis" ? `ellipsis-${i}` : item}>
                            {item === "ellipsis" ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink href="#" isActive={item === page} onClick={select(item)}>
                                    {item}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            text="Suivant"
                            aria-label="Page suivante"
                            onClick={select(page + 1)}
                            {...bound(page >= pageCount)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export function DataTable<T>({
    query,
    columns,
    rowKey,
    onRowClick,
    emptyMessage = "Aucune donnée.",
    loader = <LoadingState />,
    title,
    description,
    actions,
    className,
    pagination,
}: DataTableProps<T>) {
    const { data, isPending, isError, error, refetch } = query

    const status = (content: ReactNode) => (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="h-64">
                <div className="flex flex-col items-center justify-center gap-3 text-center">{content}</div>
            </TableCell>
        </TableRow>
    )

    return (
        <div className="flex flex-col gap-4 p-6 border rounded-xl">
            {(title || description || actions) && (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        {title && <span className="text-body-semibold">{title}</span>}
                        {description && <span className="text-small text-muted-foreground">{description}</span>}
                    </div>
                    {actions}
                </div>
            )}
            <Table className={className}>
                <TableHeader>
                    <TableRow>
                        {columns.map((col, i) => (
                            <TableHead key={i} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isPending ? (
                        status(loader)
                    ) : isError ? (
                        status(<ErrorState message={error?.message} onRetry={refetch} />)
                    ) : data && data.length === 0 ? (
                        status(<span className="text-sm text-muted-foreground">{emptyMessage}</span>)
                    ) : (
                        data && data.map((row) => (
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
                    )}
                </TableBody>
            </Table>
            {pagination && <TablePagination {...pagination} />}
        </div>
    )
}