import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MarketAsset } from "../../types/market";

async function getDefaultAssets(): Promise<MarketAsset[]> {
    return apiFetch<MarketAsset[]>("/market/defaults");
}

export function useDefaultAssets() {
    return useQuery({
        queryKey: ["market", "default-assets"],
        queryFn: getDefaultAssets,
        refetchInterval: 30_000,
    });
}