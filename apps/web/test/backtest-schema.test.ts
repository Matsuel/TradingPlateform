import { expect, test } from "bun:test"
import { createTranslator } from "next-intl"
import en from "../messages/en.json"
import { MAX_ALLOCATIONS } from "../src/features/backtest/constants"
import { createBacktestFormSchema } from "../src/features/backtest/schema"
import type { BacktestTranslator } from "../src/features/backtest/utils"

const t = createTranslator({ locale: "en", messages: en, namespace: "backtest" }) as unknown as BacktestTranslator

// Allocation de `count` actifs dont les poids totalisent 100
const form = (count: number) => ({
    name: "Test",
    investmentMode: "LUMP_SUM",
    allocations: Array.from({ length: count }, (_, i) => ({
        symbol: `S${i}`,
        weight: i === 0 ? 100 - (count - 1) : 1,
    })),
    start: new Date("2024-01-01"),
    end: new Date("2024-12-31"),
    initialAmount: 1000,
    rebalanceFrequency: "NONE",
    fee: 0.1,
    multipleStarts: false,
    extraStartDates: [],
})

test("le formulaire accepte jusqu'à MAX_ALLOCATIONS actifs et refuse au-delà avec un message traduit", () => {
    const schema = createBacktestFormSchema(t)

    expect(schema.safeParse(form(MAX_ALLOCATIONS)).success).toBe(true)
    const result = schema.safeParse(form(MAX_ALLOCATIONS + 1))
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toContain(`At most ${MAX_ALLOCATIONS} assets`)
})

const batchForm = (extra: string[], multipleStarts = true) => ({
    ...form(1),
    multipleStarts,
    extraStartDates: extra.map((date) => ({ date: new Date(date) })),
})

test("lot de départs : accepte 2 à 10 dates distinctes avant la fin, refuse sinon", () => {
    const schema = createBacktestFormSchema(t)

    expect(schema.safeParse(batchForm(["2024-03-01"])).success).toBe(true)
    expect(schema.safeParse(batchForm([])).success).toBe(false)
    expect(schema.safeParse(batchForm(["2024-01-01"])).success).toBe(false)
    expect(schema.safeParse(batchForm(["2025-03-01"])).success).toBe(false)
    const tooMany = Array.from({ length: 10 }, (_, i) => `2024-02-${String(i + 1).padStart(2, "0")}`)
    expect(schema.safeParse(batchForm(tooMany)).success).toBe(false)
})

test("hors lot, les dates supplémentaires saisies sont ignorées", () => {
    const parsed = createBacktestFormSchema(t).parse(batchForm(["2025-03-01"], false))

    expect(parsed.extraStartDates).toEqual([])
})
