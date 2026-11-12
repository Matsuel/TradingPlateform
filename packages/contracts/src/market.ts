import { z } from "zod";

// Réponses de market-service, relayées telles quelles par le proxy de core-backend jusqu'au web

// Fenêtre d'historique d'un symbole ; l'intervalle des points dépend de la période (market-service)
export const periodSchema = z.enum(["1d", "1w", "1m", "1y", "max"]);

export const marketDataSchema = z.object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    exchange: z.string().min(1),
    assetType: z.string().min(1),
    logoUrl: z.string().optional(),
});

export const marketDetailsSchema = z.object({
    // Instant de cotation
    date: z.iso.datetime(),
    // Clôture de l'intervalle, devise de cotation du symbole ; les intervalles sans clôture sont omis
    price: z.number(),
});

export const marketAssetSchema = z.object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    logoUrl: z.string().optional(),
    // Dernier cours, devise de cotation ; null si le fournisseur n'en donne pas
    price: z.number().nullable(),
    // Variation sur 24 h en pourcentage (1.5 = +1,5 %), pas en ratio ; null si inconnue
    change24h: z.number().nullable(),
    // Titres échangés sur 24 h ; null si inconnu
    volume24h: z.number().nullable(),
    // Cours des dernières 24 h, un point par heure
    history: z.array(marketDetailsSchema),
});

// Nombre maximal de symboles d'une requête de cours journaliers (GET /api/market/closes)
export const MAX_CLOSES_SYMBOLS = 50;

// Clôture journalière d'un symbole, devise de cotation ; `date` = jour de cotation dans le fuseau de la place (`YYYY-MM-DD`)
export const dailyCloseSchema = z.object({
    date: z.iso.date(),
    close: z.number(),
});

// Réponse de GET /api/market/closes : séries triées par date, par symbole demandé
export const dailyClosesSchema = z.record(z.string(), z.array(dailyCloseSchema));

// Dividende détaché : `date` = ex-date dans le fuseau de la place (`YYYY-MM-DD`), `amount` par titre, devise de cotation
export const dividendSchema = z.object({
    date: z.iso.date(),
    amount: z.number().positive(),
});

// Dividendes d'un symbole et sa devise de cotation (code ISO 4217 : "USD", "EUR")
export const symbolDividendsSchema = z.object({
    currency: z.string().min(1),
    dividends: z.array(dividendSchema),
});

// Réponse de GET /api/market/dividends : dividendes triés par date, par symbole demandé
export const dividendsSchema = z.record(z.string(), symbolDividendsSchema);

export type Period = z.infer<typeof periodSchema>;
export type MarketData = z.infer<typeof marketDataSchema>;
export type MarketDetails = z.infer<typeof marketDetailsSchema>;
export type DailyClose = z.infer<typeof dailyCloseSchema>;
export type DailyCloses = z.infer<typeof dailyClosesSchema>;
export type MarketAsset = z.infer<typeof marketAssetSchema>;
export type Dividend = z.infer<typeof dividendSchema>;
export type SymbolDividends = z.infer<typeof symbolDividendsSchema>;
export type Dividends = z.infer<typeof dividendsSchema>;
