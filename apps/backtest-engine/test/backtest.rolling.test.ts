import { describe, expect, test } from "bun:test";
import { rollingSummary } from "../engine/backtest.rolling";
import type { TwrPoint } from "../interfaces/backtest.interface";

const points: TwrPoint[] = [
    { date: "2020-01-01", index: 1 },
    { date: "2021-01-01", index: 2 },
    { date: "2021-06-01", index: 1 },
    { date: "2022-01-01", index: 0.5 },
];

describe("rollingSummary", () => {
    test("fenêtres d'un an : rendement annualisé pire, médian, meilleur, date d'entrée du pire, part négative, courbe", () => {
        // Départs 2020-01-01 (→ 2021-01-01 : +100 %) et 2021-01-01 (→ 2022-01-01 : -75 %) ; 2021-06-01 n'a pas de fenêtre complète
        expect(rollingSummary(points)).toEqual([
            {
                years: 1,
                count: 2,
                worst: -0.75,
                median: 0.125,
                best: 1,
                worstDate: "2021-01-01",
                negativeShare: 0.5,
                points: [
                    { date: "2020-01-01", value: 1 },
                    { date: "2021-01-01", value: -0.75 },
                ],
            },
        ]);
    });

    test("la fenêtre se termine au premier jour de cotation suivant la date cible", () => {
        // Cible 2021-01-02 (samedi fictif) → point du 2021-01-04
        const shifted = rollingSummary([
            { date: "2020-01-02", index: 1 },
            { date: "2021-01-04", index: 1.5 },
        ]);

        expect(shifted[0]).toMatchObject({ count: 1, worst: 0.5, best: 0.5, median: 0.5, negativeShare: 0 });
    });

    test("une durée plus longue que l'historique est absente, liste vide sous un an", () => {
        expect(rollingSummary(points).map((window) => window.years)).toEqual([1]);
        expect(rollingSummary([{ date: "2020-01-01", index: 1 }, { date: "2020-06-01", index: 2 }])).toEqual([]);
        expect(rollingSummary([])).toEqual([]);
    });

    test("3 et 5 ans : le rendement est annualisé sur la durée de la fenêtre", () => {
        const long: TwrPoint[] = [0, 1, 2, 3, 4, 5].map((year) => ({ date: `${2020 + year}-01-01`, index: 2 ** year }));

        expect(rollingSummary(long).map(({ years, count, best }) => ({ years, count, best }))).toEqual([
            { years: 1, count: 5, best: 1 },
            { years: 3, count: 3, best: 1 },
            { years: 5, count: 1, best: 1 },
        ]);
    });
});
