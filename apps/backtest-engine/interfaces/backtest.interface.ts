import type { BacktestCompletedPayload, BacktestRequestedPayload } from "@trading-plateform/contracts";

export interface PricePoint {
    // YYYY-MM-DD
    date: string;
    close: number;
}

// Cours de clôture journaliers par symbole, triés par date
export type PriceSeries = Record<string, PricePoint[]>;

// Point de l'indice de performance pondérée dans le temps (TWR, hors versements), chaîné jour après jour
export interface TwrPoint {
    // YYYY-MM-DD
    date: string;
    // Base arbitraire (1 au premier jour) : seuls les rapports entre points comptent
    index: number;
}

export type BacktestParams = Pick<
    BacktestRequestedPayload,
    "allocations" | "investmentMode" | "initialAmount" | "recurringAmount" | "investmentFrequency" | "rebalanceFrequency" | "feeRate"
>;

// Résultat calculé par l'engine : le payload complet, sans ce que le service ajoute (identifiant, horloge, provenance des cours)
export type BacktestOutcome = Omit<BacktestCompletedPayload, "executionId" | "finishedAt" | "dataSource">;
