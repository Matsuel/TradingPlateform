import { expect, test } from "bun:test"
import { createTranslator } from "next-intl"
import en from "../messages/en.json"
import fr from "../messages/fr.json"
import type { BacktestExecution } from "../src/features/backtest/types"
import { type BacktestTranslator, executionErrorLabel } from "../src/features/backtest/utils"

const failed = (errorCode?: string | null) =>
    ({ status: "FAILED", error: "technical detail", errorCode }) as BacktestExecution
const translator = (locale: "fr" | "en") =>
    createTranslator({
        locale,
        messages: locale === "fr" ? fr : en,
        namespace: "backtest",
    }) as unknown as BacktestTranslator

test("la cause d'un échec est traduite selon son code", () => {
    expect(executionErrorLabel(translator("fr"), failed("EXECUTION_TIMEOUT"), "inconnue")).toContain("relancez")
    expect(executionErrorLabel(translator("en"), failed("NO_MARKET_DATA"), "unknown")).toBe(
        "no market data for one of the symbols",
    )
})

test("un échec antérieur au code ou un code inconnu affiche le repli, jamais le message technique", () => {
    expect(executionErrorLabel(translator("en"), failed(null), "unknown")).toBe("unknown")
    expect(executionErrorLabel(translator("en"), failed(undefined), "unknown")).toBe("unknown")
    expect(executionErrorLabel(translator("en"), failed("PAS_UN_CODE"), "unknown")).toBe("unknown")
})
