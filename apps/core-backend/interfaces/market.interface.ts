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

export interface MarketDetails {
    date: string
    price: number
}

export type Period = '1d' | '1w' | '1m' | '1y' | 'max' ;