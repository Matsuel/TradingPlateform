import { useQuery } from "@tanstack/react-query";
import { getDefaultAssets } from "./api";

export function useDefaultAssets() {
    return useQuery({
        queryKey: ["market", "default-assets"],
        queryFn: getDefaultAssets,
        refetchInterval: 30_000,
    });
}