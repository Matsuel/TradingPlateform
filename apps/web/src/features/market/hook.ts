import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAssetsDetails, getDefaultAssets, getSearchAssets } from "./api";
import { MIN_SEARCH_LENGTH } from "./constants";
import type { Period } from "./types";

export function useDefaultAssets() {
    return useQuery({
        queryKey: ["market", "list"],
        queryFn: getDefaultAssets,
        refetchInterval: 30_000,
    });
}

export function useMarketDetails(symbol: string, period: Period) {
    return useQuery({
        queryKey: ["market", "detail", symbol, period],
        queryFn: () => getAssetsDetails(symbol, period),
        placeholderData: keepPreviousData, // pas de loader plein écran quand on change d'onglet
        staleTime: 60_000,
    })
}

export function useMarketSearch(query: string) {
    return useQuery({
        queryKey: ["market", "search", query],
        queryFn: () => getSearchAssets(query),
        enabled: query.length >= MIN_SEARCH_LENGTH,
    })
}
