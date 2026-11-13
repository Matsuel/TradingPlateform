import { expect, test } from "bun:test"
import { toMajorCurrency } from "../utils/currency"

test("une sous-unité est ramenée à sa devise principale avec son diviseur", () => {
    expect(toMajorCurrency("GBp")).toEqual({ currency: "GBP", divisor: 100 })
    expect(toMajorCurrency("ILA")).toEqual({ currency: "ILS", divisor: 100 })
    expect(toMajorCurrency("ZAc")).toEqual({ currency: "ZAR", divisor: 100 })
})

test("une devise principale reste inchangée", () => {
    expect(toMajorCurrency("USD")).toEqual({ currency: "USD", divisor: 1 })
    expect(toMajorCurrency("GBP")).toEqual({ currency: "GBP", divisor: 1 })
})
