"use client"

import type { ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type Column<T> = {
    header: ReactNode
    cell: (row: T) => ReactNode
    className?: string
}

type DataTableProps<T> = {
    query: Pick<UseQueryResult<T[], Error>, "data" | "isPending" | "isError" | "error" | "refetch">
    columns: Column<T>[]
    rowKey: (row: T) => string
    onRowClick?: (row: T) => void
    emptyMessage?: ReactNode
    loader?: ReactNode
    className?: string
}

export function DataTable<T>({
    query,
    columns,
    rowKey,
    onRowClick,
    emptyMessage = "Aucune donnée.",
    loader = <Loader2 className="size-6 animate-spin text-muted-foreground" />,
    className,
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
                    status(
                        <>
                            <p className="text-sm text-destructive">{error?.message}</p>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>
                                Réessayer
                            </Button>
                        </>
                    )
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
    )
}