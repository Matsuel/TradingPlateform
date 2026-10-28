import { apiFetch } from "@/lib/api";
import type { Paginated, PaginationParams } from "@/lib/pagination";
import type { MarketAsset, MarketData, MarketDetails, Period } from "./types";

export async function getDefaultAssets({ page, pageSize }: PaginationParams): Promise<Paginated<MarketAsset>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return apiFetch<Paginated<MarketAsset>>(`/market/defaults?${params.toString()}`);
}

export async function getAssetsDetails(symbol: string, period: Period): Promise<MarketDetails[]> {
    const params = new URLSearchParams({ period });
    return apiFetch<MarketDetails[]>(
        `/market/details/${encodeURIComponent(symbol)}?${params.toString()}`,
    );
}

export async function getSearchAssets(query: string): Promise<MarketData[]> {
    const params = new URLSearchParams({ query });
    return apiFetch<MarketData[]>(
        `/market/search?${params.toString()}`,
    );
}
