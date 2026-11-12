import { CURRENCY_SUBUNITS } from "../constants/market.constants";

/**
 * Devise principale d'une devise de cotation et diviseur à appliquer aux montants : `GBp` (pence) → `GBP`, 100.
 * Une devise qui n'est pas une sous-unité reste inchangée, diviseur 1.
 */
export function toMajorCurrency(currency: string): { currency: string; divisor: number } {
    return CURRENCY_SUBUNITS[currency] ?? { currency, divisor: 1 };
}
