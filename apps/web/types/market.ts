export interface MarketAsset {
    symbol: string;
    name: string;
    logoUrl?: string;
    price: number;
    change24h: number;
    volume24h: number;
    history: MarketDetails[];
}

export interface MarketDetails {
    date: string
    price: number
}