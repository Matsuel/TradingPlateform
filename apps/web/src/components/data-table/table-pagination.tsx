import type { MouseEvent } from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { getPageItems } from "@/lib/pagination"
import { cn } from "@/lib/utils"

export type TablePaginationProps = {
    page: number
    pageSize: number
    count: number
    onPageChange: (page: number) => void
}

/** Pagination sous un tableau : « 1–20 sur 134 », précédent, numéros (`getPageItems`), suivant ; rien sur une seule page. */
export function TablePagination({ page, pageSize, count, onPageChange }: TablePaginationProps) {
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
