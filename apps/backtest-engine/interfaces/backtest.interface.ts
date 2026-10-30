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
    "symbols" | "investmentMode" | "initialAmount" | "recurringAmount" | "investmentFrequency" | "feeRate"
>;

// Résultat calculé par l'engine : le payload complet, sans ce que le service ajoute (identifiant, horloge)
export type BacktestOutcome = Omit<BacktestCompletedPayload, "executionId" | "finishedAt">;
