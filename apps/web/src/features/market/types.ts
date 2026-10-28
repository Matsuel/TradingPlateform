export type Period = "1d" | "1w" | "1m" | "1y" | "max"

export interface MarketAsset {
    symbol: string;
    name: string;
    logoUrl?: string;
    price: number;
    change24h: number; // variation en pourcentage (1,5 = +1,5 %)
    volume24h: number;
    history: MarketDetails[];
}

export interface MarketDetails {
    date: string // ISO
    price: number
}

export interface MarketData {
    symbol: string
    name: string
    exchange: string
    assetType: string
    logoUrl?: string
}
