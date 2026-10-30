import { describe, expect, test } from "bun:test";
import { referencePrices } from "./backtest.fixture";
import {
    annualizedReturn,
    annualizedVolatility,
    createDrawdownTracker,
    fingerprintPrices,
    periodKey,
    round,
    sharpeRatio,
} from "./backtest.utils";

describe("round", () => {
    test("arrondit au nombre de décimales demandé", () => {
        expect(round(1.23456, 2)).toBe(1.23);
        expect(round(0.0333333, 6)).toBe(0.033333);
    });
});

describe("periodKey", () => {
    test("semaine : du lundi au dimanche", () => {
        // 2024-01-07 est un dimanche, 2024-01-08 un lundi
        expect(periodKey("2024-01-01", "WEEKLY")).toBe(periodKey("2024-01-07", "WEEKLY"));
        expect(periodKey("2024-01-07", "WEEKLY")).not.toBe(periodKey("2024-01-08", "WEEKLY"));
    });

    test("mois et année", () => {
        expect(periodKey("2024-01-31", "MONTHLY")).toBe("2024-01");
        expect(periodKey("2024-12-31", "YEARLY")).toBe("2024");
    });

    test("sans fréquence : chaque jour est une période", () => {
        expect(periodKey("2024-01-02", null)).toBe("2024-01-02");
    });
});

describe("createDrawdownTracker", () => {
    test("retient la pire baisse depuis un plus haut et sa date", () => {
        const drawdown = createDrawdownTracker();
        drawdown.record(1.2, "2024-01-02");
        drawdown.record(0.5, "2024-01-03");
        drawdown.record(1.5, "2024-01-04");

        expect(drawdown.maxDrawdown).toBe(-0.5);
        expect(drawdown.maxDrawdownDate).toBe("2024-01-03");
    });

    test("sans baisse : 0 et pas de date", () => {
        const drawdown = createDrawdownTracker();
        drawdown.record(1.1, "2024-01-02");

        expect(drawdown.maxDrawdown).toBe(0);
        expect(drawdown.maxDrawdownDate).toBeNull();
        expect(drawdown.maxDrawdownPeakDate).toBeNull();
        expect(drawdown.maxDrawdownRecoveryDate).toBeNull();
        expect(drawdown.recoveryDays).toBeNull();
    });

    test("baisse récupérée : plus haut, date de retour et jours calendaires ; record renvoie le drawdown du jour", () => {
        const drawdown = createDrawdownTracker("2024-01-01");

        expect(drawdown.record(1.2, "2024-01-02")).toBe(0);
        expect(drawdown.record(0.5, "2024-01-03")).toBe(-0.5);
        expect(drawdown.record(2, "2024-01-10")).toBe(0);
        expect(drawdown.maxDrawdownPeakDate).toBe("2024-01-02");
        expect(drawdown.maxDrawdownRecoveryDate).toBe("2024-01-10");
        expect(drawdown.recoveryDays).toBe(8);
    });

    test("baisse jamais récupérée : plus haut au premier jour, récupération null", () => {
        const drawdown = createDrawdownTracker("2024-01-01");
        drawdown.record(0.8, "2024-01-02");
        drawdown.record(1.1, "2024-01-03");

        expect(drawdown.maxDrawdown).toBeCloseTo(-0.2, 10);
        expect(drawdown.maxDrawdownPeakDate).toBe("2024-01-01");
        expect(drawdown.maxDrawdownRecoveryDate).toBeNull();
        expect(drawdown.recoveryDays).toBeNull();
    });

    test("deux baisses, la seconde plus profonde : la récupération suit la seconde", () => {
        const drawdown = createDrawdownTracker("2024-01-01");
        drawdown.record(0.75, "2024-01-02");
        drawdown.record(2, "2024-01-05");
        expect(drawdown.maxDrawdownRecoveryDate).toBe("2024-01-05");

        drawdown.record(0.25, "2024-02-01");
        expect(drawdown.maxDrawdown).toBe(-0.75);
        expect(drawdown.maxDrawdownPeakDate).toBe("2024-01-05");
        expect(drawdown.maxDrawdownRecoveryDate).toBeNull();

        drawdown.record(4, "2024-03-01");
        expect(drawdown.maxDrawdownRecoveryDate).toBe("2024-03-01");
        // 26 jours de janvier + 29 de février (2024 bissextile) + 1
        expect(drawdown.recoveryDays).toBe(56);
    });
});

describe("annualizedReturn, annualizedVolatility, sharpeRatio", () => {
    test("série constante : rendement et volatilité nuls, Sharpe null", () => {
        const points = [
            { date: "2024-01-01", index: 1 },
            { date: "2024-01-02", index: 1 },
            { date: "2024-01-03", index: 1 },
        ];

        expect(annualizedReturn(points)).toBe(0);
        expect(annualizedVolatility(points)).toBe(0);
        expect(sharpeRatio(points)).toBeNull();
    });

    test("rendement fixe à chaque point : CAGR connu, volatilité nulle", () => {
        // 2020-01-01 → 2024-01-01 = 1461 jours = 4 × 365,25 : 2,25^(1/4) − 1 = √1,5 − 1
        const points = [
            { date: "2020-01-01", index: 1 },
            { date: "2022-01-01", index: 1.5 },
            { date: "2024-01-01", index: 2.25 },
        ];

        expect(annualizedReturn(points)).toBeCloseTo(0.224745, 6);
        expect(annualizedVolatility(points)).toBe(0);
        expect(sharpeRatio(points)).toBeNull();
    });

    test("période inférieure à un an : extrapolée sur la durée calendaire", () => {
        // 182 jours (2024 bissextile) : 1,1^(365,25 / 182) − 1
        const points = [
            { date: "2024-01-01", index: 1 },
            { date: "2024-07-01", index: 1.1 },
        ];

        expect(annualizedReturn(points)).toBeCloseTo(0.210792, 6);
        // Un seul rendement : écart-type de population nul
        expect(annualizedVolatility(points)).toBe(0);
    });

    test("série variable : volatilité de population × √252 et Sharpe", () => {
        // Rendements +10 % puis −10 % : moyenne 0, écart-type 0,1 ; CAGR 0,99^(365,25 / 2) − 1
        const points = [
            { date: "2024-01-01", index: 1 },
            { date: "2024-01-02", index: 1.1 },
            { date: "2024-01-03", index: 0.99 },
        ];

        expect(annualizedReturn(points)).toBeCloseTo(-0.840457, 6);
        expect(annualizedVolatility(points)).toBeCloseTo(1.587451, 6);
        expect(sharpeRatio(points)).toBeCloseTo(-0.529438, 6);
    });

    test("un seul point ou aucun : métriques null", () => {
        const single = [{ date: "2024-01-01", index: 1 }];

        expect(annualizedReturn(single)).toBeNull();
        expect(annualizedVolatility(single)).toBeNull();
        expect(sharpeRatio(single)).toBeNull();
        expect(annualizedReturn([])).toBeNull();
    });
});

describe("fingerprintPrices", () => {
    const prices = {
        AAA: [{ date: "2024-01-02", close: 10 }],
        BBB: [{ date: "2024-01-02", close: 50 }],
    };

    test("mêmes cours : même empreinte, quel que soit l'ordre des symboles", () => {
        expect(fingerprintPrices(prices)).toBe(fingerprintPrices({ BBB: prices.BBB, AAA: prices.AAA }));
        expect(fingerprintPrices(prices)).toMatch(/^[0-9a-f]{64}$/);
    });

    test("un cours, une date ou un symbole modifié change l'empreinte", () => {
        const reference = fingerprintPrices(prices);

        expect(fingerprintPrices({ ...prices, AAA: [{ date: "2024-01-02", close: 10.01 }] })).not.toBe(reference);
        expect(fingerprintPrices({ ...prices, AAA: [{ date: "2024-01-03", close: 10 }] })).not.toBe(reference);
        expect(fingerprintPrices({ AAA: prices.AAA, CCC: prices.BBB })).not.toBe(reference);
    });

    test("jeu de référence : empreinte figée", () => {
        expect(fingerprintPrices(referencePrices)).toBe("7e2c42c9eda0d6ef5e7a5c69fce301c8c05395ce5e456b905485e310bdd96409");
    });
});
