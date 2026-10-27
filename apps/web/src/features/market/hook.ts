import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAssetsDetails, getDefaultAssets, getSearchAssets, Period } from "./api";

export function useDefaultAssets() {
    return useQuery({
        queryKey: ["market", "default-assets"],
        queryFn: getDefaultAssets,
        refetchInterval: 30_000,
    });
}

export function useMarketDetails(symbol: string, period: Period) {
    return useQuery({
        queryKey: ["market", "details", symbol, period],
        queryFn: () => getAssetsDetails(symbol, period),
        placeholderData: keepPreviousData, // pas de loader plein écran quand on change d'onglet
        staleTime: 60_000,
    })
}

export function useMarketSerach(symbol: string) {
    return useQuery({
        queryKey: ["search", "search-assets", symbol],
        queryFn: () => getSearchAssets(symbol),
        enabled: symbol.length > 2
    })
}