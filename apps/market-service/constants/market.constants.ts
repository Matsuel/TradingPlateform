import type { Period } from "@azimut/contracts";

export const DEFAULT_TICKERS = [
    "AAPL",    // Apple
    "MSFT",    // Microsoft
    "NVDA",    // NVIDIA
    "AMZN",    // Amazon
    "GOOGL",   // Alphabet
    "TSLA",    // Tesla
    "META",    // Meta
    "JPM",     // JPMorgan
    "BTC-USD", // Bitcoin
    "KO",      // Coca-Cola
    "AZN.L",   // AstraZeneca
    "HSBA.L",  // HSBC
    "MC.PA",   // LVMH
    "TTE.PA",  // TotalEnergies
    "^GSPC",   // S&P 500
];
const MINUTE_MS = 60_000;

// Nombre maximal d'entrées du cache mémoire
export const CACHE_MAX_ENTRIES = 500;

// Durée de garde en cache des réponses du fournisseur : la recherche change peu, un historique court se périme plus vite qu'un long
export const SEARCH_CACHE_TTL_MS = 10 * MINUTE_MS;
export const ASSETS_CACHE_TTL_MS = MINUTE_MS;
export const DETAILS_CACHE_TTL_MS: Record<Period, number> = {
    "1d": MINUTE_MS,
    "1w": 5 * MINUTE_MS,
    "1m": 30 * MINUTE_MS,
    "1y": 60 * MINUTE_MS,
    max: 6 * 60 * MINUTE_MS,
};

// Devises cotées en sous-unité par Yahoo (pence, agorot, cents) : devise principale et nombre de sous-unités qu'elle contient
export const CURRENCY_SUBUNITS: Record<string, { currency: string; divisor: number }> = {
    GBp: { currency: "GBP", divisor: 100 },
    GBX: { currency: "GBP", divisor: 100 },
    ILA: { currency: "ILS", divisor: 100 },
    ZAc: { currency: "ZAR", divisor: 100 },
};
