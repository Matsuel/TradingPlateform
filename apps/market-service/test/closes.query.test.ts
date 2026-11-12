import { expect, test } from "bun:test"
import { MAX_CLOSES_SYMBOLS } from "@trading-plateform/contracts"
import { dailyClosesQuerySchema } from "../interfaces/market.interface"

const valid = { symbols: "AAPL, MSFT,AAPL", start: "2024-01-02T00:00:00.000Z", end: "2024-01-10T00:00:00.000Z" }

test("les symboles sont découpés, nettoyés et dédoublonnés, les dates converties", () => {
    const parsed = dailyClosesQuerySchema.parse(valid)

    expect(parsed.symbols).toEqual(["AAPL", "MSFT"])
    expect(parsed.start).toEqual(new Date("2024-01-02T00:00:00.000Z"))
})

test("refuse une requête sans symbole, avec trop de symboles ou aux dates inversées", () => {
    expect(dailyClosesQuerySchema.safeParse({ ...valid, symbols: " , " }).success).toBe(false)
    expect(dailyClosesQuerySchema.safeParse({ ...valid, symbols: Array.from({ length: MAX_CLOSES_SYMBOLS + 1 }, (_, i) => `S${i}`).join(",") }).success).toBe(false)
    expect(dailyClosesQuerySchema.safeParse({ ...valid, start: valid.end, end: valid.start }).success).toBe(false)
    expect(dailyClosesQuerySchema.safeParse({ ...valid, start: "2024-01-02" }).success).toBe(false)
})
