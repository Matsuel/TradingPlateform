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
    allocations: Array.from({ length: count }, (_, i) => ({ symbol: `S${i}`, weight: i === 0 ? 100 - (count - 1) : 1 })),
    start: new Date("2024-01-01"),
    end: new Date("2024-12-31"),
    initialAmount: 1000,
    rebalanceFrequency: "NONE",
    fee: 0.1,
})

test("le formulaire accepte jusqu'à MAX_ALLOCATIONS actifs et refuse au-delà avec un message traduit", () => {
    const schema = createBacktestFormSchema(t)

    expect(schema.safeParse(form(MAX_ALLOCATIONS)).success).toBe(true)
    const result = schema.safeParse(form(MAX_ALLOCATIONS + 1))
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toContain(`At most ${MAX_ALLOCATIONS} assets`)
})
