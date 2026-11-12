import { expect, test } from "bun:test"
import type { ZodSafeParseResult } from "zod"
import { MAX_CLOSES_SYMBOLS } from "@trading-plateform/contracts"
import { backtestCompareQuerySchema, createBacktestSchema } from "../interfaces/backtest.interface"

const valid = {
    name: "Test",
    investmentMode: "LUMP_SUM",
    allocations: [{ symbol: "AAPL", weight: 60 }, { symbol: "MSFT", weight: 40 }],
    start: "2024-01-01",
    end: "2024-12-31",
    initialAmount: 1000,
    fee: 0.1,
}

// Codes des issues personnalisées : le web les traduit, il ne lit jamais le message anglais
const codeOf = (issue: object) => (issue as { params?: { code?: string } }).params?.code
const issueCodes = (result: ZodSafeParseResult<unknown>) => result.error?.issues.map(codeOf)

test("un backtest valide convertit les poids en ratios et les frais en fraction", () => {
    const parsed = createBacktestSchema.parse(valid)

    expect(parsed.allocations).toEqual([{ symbol: "AAPL", weight: 0.6 }, { symbol: "MSFT", weight: 0.4 }])
    expect(parsed.rebalanceFrequency).toBe("NONE")
})

test("poids ne totalisant pas 100 → WEIGHTS_NOT_100", () => {
    const result = createBacktestSchema.safeParse({ ...valid, allocations: [{ symbol: "AAPL", weight: 60 }] })

    expect(issueCodes(result)).toContain("WEIGHTS_NOT_100")
})

test("symbole en double → SYMBOLS_NOT_UNIQUE", () => {
    const result = createBacktestSchema.safeParse({ ...valid, allocations: [{ symbol: "AAPL", weight: 50 }, { symbol: "AAPL", weight: 50 }] })

    expect(issueCodes(result)).toContain("SYMBOLS_NOT_UNIQUE")
})

test("fin avant début → END_BEFORE_START, sur le chemin end", () => {
    const result = createBacktestSchema.safeParse({ ...valid, start: "2024-12-31", end: "2024-01-01" })

    expect(issueCodes(result)).toContain("END_BEFORE_START")
    expect(result.error?.issues.find((issue) => codeOf(issue) === "END_BEFORE_START")?.path).toEqual(["end"])
})

test("règles du versement récurrent", () => {
    expect(issueCodes(createBacktestSchema.safeParse({ ...valid, investmentMode: "RECURRING" }))).toContain("RECURRING_AMOUNT_REQUIRED")
    expect(issueCodes(createBacktestSchema.safeParse({ ...valid, recurringAmount: 100 }))).toContain("RECURRING_AMOUNT_NOT_ALLOWED")
    expect(issueCodes(createBacktestSchema.safeParse({ ...valid, initialAmount: 0 }))).toContain("INITIAL_AMOUNT_NOT_POSITIVE")
})

test("comparaison : deux ids distincts exigés", () => {
    expect(backtestCompareQuerySchema.safeParse({ ids: "a,b" }).success).toBe(true)
    expect(issueCodes(backtestCompareQuerySchema.safeParse({ ids: "a,a" }))).toContain("IDS_NOT_DISTINCT")
    expect(backtestCompareQuerySchema.safeParse({ ids: "a" }).success).toBe(false)
    expect(backtestCompareQuerySchema.safeParse({ ids: "a,b,c" }).success).toBe(false)
})

test("plus d'allocations que market-service n'accepte de symboles (benchmark compris) : refusé", () => {
    const allocations = (count: number) => Array.from({ length: count }, (_, i) => ({ symbol: `S${i}`, weight: 1 }))

    expect(createBacktestSchema.safeParse({ ...valid, allocations: allocations(MAX_CLOSES_SYMBOLS) }).success).toBe(false)
})
