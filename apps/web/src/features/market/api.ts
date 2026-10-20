import { apiFetch } from "@/lib/api";
import { MarketAsset, MarketData } from "./types";

export type Period = "1d" | "1w" | "1m" | "1y" | "max"
export type MarketDetails = { date: string; price: number } // les dates arrivent en string via le JSON

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