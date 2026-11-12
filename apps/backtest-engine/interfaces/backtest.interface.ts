import type { BacktestCompletedPayload, BacktestRequestedPayload, DailyClose, Dividend } from "@trading-plateform/contracts";

// Clôture d'un jour de cotation (`YYYY-MM-DD`), devise de cotation
export type PricePoint = DailyClose;

// Cours de clôture journaliers par symbole, triés par date
export type PriceSeries = Record<string, PricePoint[]>;

// Dividendes par symbole, triés par date : ex-date `YYYY-MM-DD`, montant par titre dans la devise de cotation
export type DividendSeries = Record<string, Dividend[]>;

// Devise de cotation (ISO 4217) de chaque symbole ; un symbole absent est traité comme coté en euros
export type Currencies = Record<string, string>;

// Données de marché d'une simulation : cours et dividendes dans la même devise
export interface MarketInput {
    prices: PriceSeries;
    dividends: DividendSeries;
}

// Point de l'indice de performance pondérée dans le temps (TWR, hors versements), chaîné jour après jour
export interface TwrPoint {
    // YYYY-MM-DD
    date: string;
    // Base arbitraire (1 au premier jour) : seuls les rapports entre points comptent
    index: number;
}

export type BacktestParams = Pick<
    BacktestRequestedPayload,
    "allocations" | "investmentMode" | "initialAmount" | "recurringAmount" | "investmentFrequency" | "rebalanceFrequency" | "feeRate" | "benchmarkSymbol"
>;

// Résultat calculé par l'engine : le payload complet, sans ce que le service ajoute (identifiant, horloge, provenance des cours)
export type BacktestOutcome = Omit<BacktestCompletedPayload, "executionId" | "finishedAt" | "dataSource">;
