import { z } from "zod";

export const searchMarketSchema = z.object({
    query: z.string().trim().min(2),
});

export const marketIdSchema = z.string().trim().min(1);

export const periodSchema = z.enum(["1d", "1w", "1m", "1y", "max"]);

export type Period = z.infer<typeof periodSchema>;

export interface MarketData {
    symbol: string
    name: string
    exchange: string
    assetType: string
    logoUrl?: string
}

export interface MarketAsset {
    symbol: string;
    name: string;
    price: number | null;
    change24h: number | null;
    volume24h: number | null;
    history: MarketDetails[];
    logoUrl: string | undefined;
}

// Sérialisé en JSON : date ISO, prix null quand Yahoo n'a pas de clôture
export interface MarketDetails {
    date: Date
    price: number | null
}
