import { apiFetch } from "@/lib/api";
import type { MarketAsset, MarketData, MarketDetails, Period } from "./types";

export async function getDefaultAssets(): Promise<MarketAsset[]> {
    return apiFetch<MarketAsset[]>("/market/defaults");
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
