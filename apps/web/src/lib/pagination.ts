// Aligné sur packages/contracts/src/pagination.ts : count = total des éléments filtrés, toutes pages confondues
export interface Paginated<T> {
    data: T[]
    count: number
    page: number // commence à 1
    pageSize: number
}

export type PaginationParams = Pick<Paginated<unknown>, "page" | "pageSize">

// Au-delà de 7 pages : première, dernière, voisines de la page courante, trous remplacés par "ellipsis"
export function getPageItems(page: number, pageCount: number): (number | "ellipsis")[] {
    const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
    if (pageCount <= 7) return range(1, pageCount)
    if (page <= 4) return [...range(1, 5), "ellipsis", pageCount]
    if (page >= pageCount - 3) return [1, "ellipsis", ...range(pageCount - 4, pageCount)]
    return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount]
}

export const paginate = <T>(items: T[], page: number, pageSize: number) =>
    items.slice((page - 1) * pageSize, page * pageSize)
