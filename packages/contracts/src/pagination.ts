import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Query string d'une route de liste : ?page=1&pageSize=20 (page commence à 1)
export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// Réponse d'une route de liste ; count = total des éléments correspondant au filtre, toutes pages confondues
export interface Paginated<T> {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
}
