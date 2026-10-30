import { describe, expect, test } from "bun:test";
import { createDrawdownTracker, periodKey, round } from "./backtest.utils";

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
    });
});
