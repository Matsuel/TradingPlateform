import { expect, test } from "bun:test";
import { fxPairSymbol, foreignCurrencies, toReferenceCurrency } from "../engine/backtest.fx";
import BacktestError from "../errors/backtest.error";

const usd = { AAA: "USD", BBB: "EUR" };
const rates = { [fxPairSymbol("USD")]: [{ date: "2024-01-03", close: 1.1 }, { date: "2024-01-05", close: 1.25 }] };

test("foreignCurrencies ne garde que les devises hors euro, sans doublon", () => {
    expect(foreignCurrencies(["AAA", "BBB", "CCC"], { ...usd, CCC: "USD" })).toEqual(["USD"]);
    expect(foreignCurrencies(["BBB", "ZZZ"], usd)).toEqual([]);
});

test("toReferenceCurrency divise cours et dividendes par le dernier taux connu du jour", () => {
    const market = {
        prices: { AAA: [{ date: "2024-01-03", close: 110 }, { date: "2024-01-04", close: 110 }, { date: "2024-01-05", close: 125 }], BBB: [{ date: "2024-01-03", close: 50 }] },
        dividends: { AAA: [{ date: "2024-01-04", amount: 1.1 }] },
    };

    const converted = toReferenceCurrency(market, usd, rates);

    for (const point of converted.prices.AAA!) expect(point.close).toBeCloseTo(100, 10);
    expect(converted.dividends.AAA![0]!.amount).toBeCloseTo(1, 10);
    // Symbole coté en euros : inchangé
    expect(converted.prices.BBB).toEqual(market.prices.BBB);
});

test("une date antérieure au premier taux prend le premier taux de la série", () => {
    const market = { prices: { AAA: [{ date: "2024-01-02", close: 110 }] }, dividends: {} };

    expect(toReferenceCurrency(market, usd, rates).prices.AAA![0]!.close).toBeCloseTo(100, 10);
});

test("le taux d'une devise étrangère manquant lève NO_MARKET_DATA", () => {
    const market = { prices: { AAA: [{ date: "2024-01-03", close: 110 }] }, dividends: {} };

    expect(() => toReferenceCurrency(market, usd, {})).toThrow(BacktestError);
    expect(() => toReferenceCurrency(market, usd, {})).toThrow("No market data for EURUSD=X");
});
