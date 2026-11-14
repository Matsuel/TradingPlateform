import { expect, test } from "bun:test"
import type { ZodSafeParseResult } from "zod"
import { MAX_CLOSES_SYMBOLS } from "@azimut/contracts"
import { backtestCompareQuerySchema, createBacktestSchema, createBatchSchema } from "../interfaces/backtest.interface"

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

const { start, ...batchBase } = valid
const validBatch = { ...batchBase, end: "2026-06-30", startDates: ["2024-01-01", "2024-03-01"] }

test("un lot valide accepte 2 à 10 dates de départ", () => {
    expect(createBatchSchema.parse(validBatch).startDates).toHaveLength(2)
    expect(createBatchSchema.safeParse({ ...validBatch, startDates: ["2024-01-01"] }).success).toBe(false)
    const eleven = Array.from({ length: 11 }, (_, i) => `2024-${String(i + 1).padStart(2, "0")}-01`)
    expect(createBatchSchema.safeParse({ ...validBatch, startDates: eleven }).success).toBe(false)
})

test("lot : dates en double → START_DATES_NOT_UNIQUE", () => {
    const result = createBatchSchema.safeParse({ ...validBatch, startDates: ["2024-01-01", "2024-01-01"] })

    expect(issueCodes(result)).toContain("START_DATES_NOT_UNIQUE")
})

test("lot : un départ à moins d'un an de la fin → START_TOO_CLOSE_TO_END", () => {
    const result = createBatchSchema.safeParse({ ...validBatch, end: "2025-06-30", startDates: ["2024-01-01", "2024-07-01"] })

    expect(issueCodes(result)).toContain("START_TOO_CLOSE_TO_END")
    expect(createBatchSchema.safeParse({ ...validBatch, end: "2025-06-30", startDates: ["2024-01-01", "2024-06-30"] }).success).toBe(true)
})

test("lot : les règles du mode d'investissement s'appliquent", () => {
    const result = createBatchSchema.safeParse({ ...validBatch, investmentMode: "RECURRING" })

    expect(issueCodes(result)).toContain("RECURRING_AMOUNT_REQUIRED")
})
