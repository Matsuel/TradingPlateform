import { createHash } from "node:crypto";
import type { BacktestParams, PriceSeries } from "../interfaces/backtest.interface";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Arrondit au nombre de décimales demandé (2 pour un montant, 4 pour un cours, 6 pour un ratio ou une quantité).
 * À n'appliquer qu'aux valeurs publiées : les cumuls se font sur les valeurs non arrondies.
 */
export const round = (value: number, decimals: number) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

/**
 * Clé de la période d'une date de cotation (`YYYY-MM-DD`) selon la fréquence de versement.
 * Un versement récurrent a lieu au premier jour de cotation dont la clé diffère de la veille.
 * Sans fréquence (investissement unique), chaque jour est sa propre période.
 */
export const periodKey = (date: string, frequency: BacktestParams["investmentFrequency"]) => {
    switch (frequency) {
        case "WEEKLY":
            // 1970-01-01 est un jeudi : +3 jours fait commencer les semaines le lundi
            return String(Math.floor((Date.parse(date) / DAY_MS + 3) / 7));
        case "MONTHLY":
            return date.slice(0, 7);
        case "YEARLY":
            return date.slice(0, 4);
        default:
            return date;
    }
};

/**
 * Suit la perte maximale depuis un plus haut (max drawdown) sur un indice de performance
 * chaîné jour après jour : les versements du DCA ne masquent donc pas les baisses.
 *
 * Usage : `record(rendementDuJour, date)` chaque jour après le premier, puis lire `maxDrawdown`
 * (ratio ≤ 0, `-0.2` = -20 %) et `maxDrawdownDate` (`YYYY-MM-DD`, null sans baisse).
 */
export function createDrawdownTracker() {
    let index = 1;
    let peak = 1;
    let maxDrawdown = 0;
    let maxDrawdownDate: string | null = null;

    return {
        /** `dailyReturn` : valeur du jour / valeur de la veille après versement (1.02 = +2 %). */
        record(dailyReturn: number, date: string) {
            index *= dailyReturn;
            peak = Math.max(peak, index);
            if (index / peak - 1 < maxDrawdown) {
                maxDrawdown = index / peak - 1;
                maxDrawdownDate = date;
            }
        },
        get maxDrawdown() {
            return maxDrawdown;
        },
        get maxDrawdownDate() {
            return maxDrawdownDate;
        },
    };
}

/**
 * Empreinte SHA-256 (hexadécimal) des séries de cours : identifie exactement les données d'entrée d'une exécution.
 * Canonique : indépendante de l'ordre des symboles ; change dès qu'un cours, une date ou un symbole change.
 */
export function fingerprintPrices(prices: PriceSeries): string {
    const canonical = Object.keys(prices)
        .sort()
        .map((symbol) => [symbol, prices[symbol]!.map((point) => [point.date, point.close])]);
    return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}
