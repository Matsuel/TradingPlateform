import { apiFetch } from "@/lib/api";
import { MarketAsset } from "./types";

export async function getDefaultAssets(): Promise<MarketAsset[]> {
    return apiFetch<MarketAsset[]>("/market/defaults");
}