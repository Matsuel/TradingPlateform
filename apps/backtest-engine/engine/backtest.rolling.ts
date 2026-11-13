import { addYears, median } from "@trading-plateform/utils";
import { ROLLING_WINDOW_YEARS, type RollingWindow } from "@trading-plateform/contracts";
import type { TwrPoint } from "../interfaces/backtest.interface";
import { round } from "./backtest.utils";

/**
 * Rendement annualisé de l'indice TWR (hors versements, ratio annuel : `0.08` = +8 %/an) sur chaque fenêtre glissante de
 * `years` années, une fenêtre par jour de cotation de départ (D2), du plus ancien départ au plus récent. La fenêtre qui part de
 * `d` se termine au premier jour de cotation ≥ `d` + `years` ans, et son rendement `r` est annualisé : `(1 + r) ^ (1 / years) − 1`.
 * Un départ trop proche de la fin de l'historique n'a pas de fenêtre complète et est ignoré. `points` triés par date.
 */
function windowReturns(points: TwrPoint[], years: number): RollingWindow["points"] {
    const windows: RollingWindow["points"] = [];
    let end = 0;
    for (const start of points) {
        const target = addYears(new Date(start.date), years).toISOString().slice(0, 10);
        while (end < points.length && points[end]!.date < target) end++;
        if (end === points.length) break;
        windows.push({ date: start.date, value: (points[end]!.index / start.index) ** (1 / years) - 1 });
    }
    return windows;
}

/**
 * Résumé des fenêtres glissantes de 1, 3 et 5 ans (`ROLLING_WINDOW_YEARS`) : rendements annualisés pire, médian et meilleur,
 * date d'entrée de la pire fenêtre, part négative et courbe selon la date d'entrée.
 * Une durée plus longue que l'historique est absente du résultat ; liste vide si même la plus courte n'y tient pas.
 * Ratios arrondis à 6 décimales (4 pour les points de la courbe).
 */
export function rollingSummary(points: TwrPoint[]): RollingWindow[] {
    return ROLLING_WINDOW_YEARS.flatMap((years) => {
        const windows = windowReturns(points, years);
        if (windows.length === 0) return [];
        const sorted = windows.map((window) => window.value).sort((a, b) => a - b);
        const worst = windows.reduce((lowest, window) => (window.value < lowest.value ? window : lowest));
        return [
            {
                years,
                count: windows.length,
                worst: round(worst.value, 6),
                median: round(median(sorted), 6),
                best: round(sorted.at(-1)!, 6),
                worstDate: worst.date,
                // Négatif = rendement de la fenêtre négatif, donc rendement annualisé négatif aussi
                negativeShare: round(sorted.filter((value) => value < 0).length / sorted.length, 6),
                points: windows.map((window) => ({ date: window.date, value: round(window.value, 4) })),
            },
        ];
    });
}
