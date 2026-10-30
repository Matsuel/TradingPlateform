import { createHash } from "node:crypto";
import type { BacktestParams, PriceSeries, TwrPoint } from "../interfaces/backtest.interface";

const DAY_MS = 24 * 60 * 60 * 1000;
// Année calendaire moyenne (années bissextiles comprises), base d'annualisation du CAGR
const DAYS_PER_YEAR = 365.25;
export const TRADING_DAYS_PER_YEAR = 252;
// Taux sans risque du Sharpe : ratio annuel, hypothèse fixe affichée avec le résultat
export const RISK_FREE_RATE = 0;

const calendarDaysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

/**
 * Arrondit au nombre de décimales demandé (2 pour un montant, 4 pour un cours, 6 pour un ratio ou une quantité).
 * À n'appliquer qu'aux valeurs publiées : les cumuls se font sur les valeurs non arrondies.
 */
export const round = (value: number, decimals: number) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

/**
 * Clé de la période d'une date de cotation (`YYYY-MM-DD`) selon la fréquence de versement ou de rebalancement.
 * Un versement récurrent (ou un rebalancement) a lieu au premier jour de cotation dont la clé diffère de la veille.
 * Sans fréquence (investissement unique), chaque jour est sa propre période.
 */
export const periodKey = (
    date: string,
    frequency: BacktestParams["investmentFrequency"] | Exclude<BacktestParams["rebalanceFrequency"], "NONE">,
) => {
    switch (frequency) {
        case "WEEKLY":
            // 1970-01-01 est un jeudi : +3 jours fait commencer les semaines le lundi
            return String(Math.floor((Date.parse(date) / DAY_MS + 3) / 7));
        case "MONTHLY":
            return date.slice(0, 7);
        case "QUARTERLY":
            return `${date.slice(0, 4)}-Q${Math.ceil(Number(date.slice(5, 7)) / 3)}`;
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
 * `startDate` (`YYYY-MM-DD`) : premier jour de la série, date du plus haut initial (indice 1).
 * Sans elle, une pire baisse partie du premier jour a un `maxDrawdownPeakDate` null.
 *
 * Usage : `record(rendementDuJour, date)` chaque jour après le premier, puis lire :
 * - `maxDrawdown` : ratio ≤ 0 (`-0.2` = -20 %), `maxDrawdownDate` : creux (`YYYY-MM-DD`, null sans baisse) ;
 * - `maxDrawdownPeakDate` : plus haut précédant ce creux (null sans baisse) ;
 * - `maxDrawdownRecoveryDate` : premier jour où l'indice retrouve ce plus haut (null si non récupéré ou sans baisse) ;
 * - `recoveryDays` : jours calendaires du plus haut à la récupération (null si non récupéré ou sans baisse).
 */
export function createDrawdownTracker(startDate: string | null = null) {
    let index = 1;
    let peak = 1;
    let peakDate = startDate;
    let maxDrawdown = 0;
    let maxDrawdownDate: string | null = null;
    // Plus haut à retrouver pour la pire baisse en cours ; null une fois récupéré
    let maxDrawdownPeak: number | null = null;
    let maxDrawdownPeakDate: string | null = null;
    let maxDrawdownRecoveryDate: string | null = null;

    return {
        /**
         * `dailyReturn` : valeur du jour / valeur de la veille après versement (1.02 = +2 %).
         * Renvoie le drawdown du jour (ratio ≤ 0, 0 sur un plus haut), pour la courbe.
         */
        record(dailyReturn: number, date: string) {
            index *= dailyReturn;
            if (maxDrawdownPeak !== null && index >= maxDrawdownPeak) {
                maxDrawdownPeak = null;
                maxDrawdownRecoveryDate = date;
            }
            // Strict : un jour plat au plus haut ne déplace pas sa date
            if (index > peak) {
                peak = index;
                peakDate = date;
            }
            const current = index / peak - 1;
            if (current < maxDrawdown) {
                // Une baisse plus profonde remplace la précédente, récupérée ou non
                maxDrawdownRecoveryDate = null;
                maxDrawdown = current;
                maxDrawdownDate = date;
                maxDrawdownPeak = peak;
                maxDrawdownPeakDate = peakDate;
            }
            return current;
        },
        get maxDrawdown() {
            return maxDrawdown;
        },
        get maxDrawdownDate() {
            return maxDrawdownDate;
        },
        get maxDrawdownPeakDate() {
            return maxDrawdownPeakDate;
        },
        get maxDrawdownRecoveryDate() {
            return maxDrawdownRecoveryDate;
        },
        get recoveryDays() {
            return maxDrawdownPeakDate !== null && maxDrawdownRecoveryDate !== null
                ? calendarDaysBetween(maxDrawdownPeakDate, maxDrawdownRecoveryDate)
                : null;
        },
    };
}

/** Rendements journaliers (`0.01` = +1 %) entre points consécutifs de l'indice TWR. */
const dailyReturns = (points: TwrPoint[]) => points.slice(1).map((point, i) => point.index / points[i]!.index - 1);

/**
 * Rendement annualisé (CAGR, ratio annuel : `0.07` = +7 %/an) de l'indice TWR, hors versements :
 * `(indexFinal / indexInitial) ^ (365,25 / joursCalendaires) − 1`.
 * Annualisé sur la durée calendaire réelle, y compris sous un an (extrapolation).
 * `points` triés par date. `null` sous deux points ou si les dates extrêmes coïncident.
 */
export function annualizedReturn(points: TwrPoint[]): number | null {
    if (points.length < 2) return null;
    const first = points[0]!;
    const last = points.at(-1)!;
    const days = calendarDaysBetween(first.date, last.date);
    if (days <= 0) return null;
    return (last.index / first.index) ** (DAYS_PER_YEAR / days) - 1;
}

/**
 * Volatilité annualisée (ratio annuel : `0.15` = 15 %/an) : écart-type des rendements journaliers TWR × √252.
 * Écart-type de population (division par n, pas n − 1) : la série est tout l'historique simulé, pas un
 * échantillon, et un seul rendement (deux points) donne 0 au lieu d'une valeur indéfinie.
 * `points` triés par date. `null` sous deux points.
 */
export function annualizedVolatility(points: TwrPoint[]): number | null {
    if (points.length < 2) return null;
    const returns = dailyReturns(points);
    const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

/**
 * Ratio de Sharpe (sans unité) : `(annualizedReturn − RISK_FREE_RATE) / annualizedVolatility`.
 * `null` sous deux points ou si la volatilité est nulle (série sans variation).
 */
export function sharpeRatio(points: TwrPoint[]): number | null {
    const annualReturn = annualizedReturn(points);
    const volatility = annualizedVolatility(points);
    if (annualReturn === null || volatility === null || volatility === 0) return null;
    return (annualReturn - RISK_FREE_RATE) / volatility;
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
