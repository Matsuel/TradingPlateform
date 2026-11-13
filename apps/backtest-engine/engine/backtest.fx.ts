import type { Dividend } from "@trading-plateform/contracts";
import BacktestError from "../errors/backtest.error";
import type { Currencies, MarketInput, PricePoint, PriceSeries } from "../interfaces/backtest.interface";

// Devise de référence (D3) : les versements, valeurs et frais d'un backtest sont en euros
export const REFERENCE_CURRENCY = "EUR";

/** Symbole yahoo de la paire qui cote 1 € en `currency` (`EURUSD=X` = dollars par euro). */
export const fxPairSymbol = (currency: string) => `${REFERENCE_CURRENCY}${currency}=X`;

/** Devises à convertir, sans doublon : celles des symboles qui ne cotent pas en euros. */
export const foreignCurrencies = (symbols: string[], currencies: Currencies) => [
    ...new Set(symbols.map((symbol) => currencies[symbol]).filter((currency): currency is string => !!currency && currency !== REFERENCE_CURRENCY)),
];

/**
 * Taux du jour `date` : dernier taux connu à cette date, ou le premier de la série si `date` le précède
 * (un départ un week-end n'a pas de taux la veille). `rates` triés par date, non vide.
 */
function rateOn(rates: PricePoint[], date: string): number {
    let low = 0;
    let high = rates.length;
    while (low < high) {
        const middle = (low + high) >> 1;
        if (rates[middle]!.date <= date) low = middle + 1;
        else high = middle;
    }
    return rates[Math.max(low - 1, 0)]!.close;
}

/**
 * Convertit en euros les cours et dividendes des symboles cotés dans une autre devise, au taux du jour (D3) :
 * `montant en euros = montant local / taux`, `taux` = unités de la devise pour 1 € (`fxRates`, une paire `EURxxx=X` par devise).
 * Les symboles cotés en euros, ou sans devise connue, restent inchangés.
 *
 * Lève `BacktestError` « No market data for EURxxx=X » si le taux d'une devise manque.
 */
export function toReferenceCurrency({ prices, dividends }: MarketInput, currencies: Currencies, fxRates: PriceSeries): MarketInput {
    const ratesFor = (symbol: string): PricePoint[] | null => {
        const currency = currencies[symbol];
        if (!currency || currency === REFERENCE_CURRENCY) return null;
        const rates = fxRates[fxPairSymbol(currency)];
        if (!rates?.length) throw new BacktestError("NO_MARKET_DATA", `No market data for ${fxPairSymbol(currency)}`);
        return rates;
    };

    const convertedPrices: PriceSeries = {};
    for (const [symbol, series] of Object.entries(prices)) {
        const rates = ratesFor(symbol);
        convertedPrices[symbol] = rates ? series.map(({ date, close }) => ({ date, close: close / rateOn(rates, date) })) : series;
    }

    const convertedDividends: Record<string, Dividend[]> = {};
    for (const [symbol, series] of Object.entries(dividends)) {
        const rates = ratesFor(symbol);
        convertedDividends[symbol] = rates ? series.map(({ date, amount }) => ({ date, amount: amount / rateOn(rates, date) })) : series;
    }

    return { prices: convertedPrices, dividends: convertedDividends };
}
