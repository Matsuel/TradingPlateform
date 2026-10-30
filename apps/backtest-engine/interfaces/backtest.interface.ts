import type { BacktestCompletedPayload, BacktestRequestedPayload } from "@trading-plateform/contracts";

export interface PricePoint {
    // YYYY-MM-DD
    date: string;
    close: number;
}

// Cours de clôture journaliers par symbole, triés par date
export type PriceSeries = Record<string, PricePoint[]>;

export type BacktestParams = Pick<
    BacktestRequestedPayload,
    "allocations" | "investmentMode" | "initialAmount" | "recurringAmount" | "investmentFrequency" | "rebalanceFrequency" | "feeRate"
>;

// Résultat calculé par l'engine : le payload complet, sans ce que le service ajoute (identifiant, horloge, provenance des cours)
export type BacktestOutcome = Omit<BacktestCompletedPayload, "executionId" | "finishedAt" | "dataSource">;
