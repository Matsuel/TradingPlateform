import type { PricePoint, PriceSeries } from "../interfaces/backtest.interface";

/**
 * Série de cours synthétique et déterministe pour les tests de reproductibilité : marche aléatoire en centimes
 * pilotée par un générateur congruentiel à graine fixe. Calcul entier uniquement : mêmes cours sur toute machine.
 * Jours ouvrés seulement (lundi-vendredi), à partir de `start` (`YYYY-MM-DD`).
 */
export function syntheticSeries(seed: number, start: string, days: number, startCents: number): PricePoint[] {
    let state = seed;
    let cents = startCents;
    const date = new Date(`${start}T00:00:00Z`);
    const points: PricePoint[] = [];

    while (points.length < days) {
        const weekday = date.getUTCDay();
        if (weekday !== 0 && weekday !== 6) {
            // Générateur de Park-Miller : entier, reproductible
            state = (state * 48271) % 2147483647;
            cents = Math.max(100, cents + (state % 401) - 198);
            points.push({ date: date.toISOString().slice(0, 10), close: cents / 100 });
        }
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return points;
}

// Deux ans de cours sur deux symboles : jeu de référence figé des tests de reproductibilité
export const referencePrices: PriceSeries = {
    AAA: syntheticSeries(42, "2022-01-03", 520, 10_000),
    BBB: syntheticSeries(7, "2022-01-03", 520, 5_000),
};
