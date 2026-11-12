import { afterEach, expect, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"
import fr from "../messages/fr.json"
import { DividendsTable } from "../src/features/backtest/dividends-table"
import { ReturnBreakdownCard } from "../src/features/backtest/return-breakdown"
import type { BacktestResult } from "../src/features/backtest/types"
import { hasDividendDetails } from "../src/features/backtest/utils"

afterEach(cleanup)

const inFrench = (node: ReactNode) =>
    render(
        <NextIntlClientProvider locale="fr" messages={fr}>
            {node}
        </NextIntlClientProvider>,
    )

const result = (extra: Partial<BacktestResult>) => extra as BacktestResult
const breakdown = { price: 1.898, dividends: 0.186, local: 2.084, fx: 0.064 }

test("hasDividendDetails : dividendes ou change à détailler, jamais pour un résultat antérieur", () => {
    expect(hasDividendDetails(result({ returnBreakdown: breakdown, dividendTotal: "0" }))).toBe(true)
    expect(hasDividendDetails(result({ returnBreakdown: { ...breakdown, fx: null }, dividendTotal: "12.5" }))).toBe(
        true,
    )
    expect(hasDividendDetails(result({ returnBreakdown: { ...breakdown, fx: null }, dividendTotal: "0" }))).toBe(false)
    expect(hasDividendDetails(result({ dividendTotal: "12.5" }))).toBe(false)
})

test("la décomposition affiche les cinq lignes quand il y a un effet de change", () => {
    inFrench(<ReturnBreakdownCard breakdown={breakdown} totalReturn={2.148} />)

    for (const label of [
        "Cours (devise locale)",
        "Dividendes réinvestis",
        "= Rendement en devise locale",
        "Contribution du change",
        "= Rendement en EUR",
    ])
        expect(screen.getByText(label)).toBeTruthy()
})

test("sans change, la décomposition omet les lignes devise locale et change", () => {
    inFrench(<ReturnBreakdownCard breakdown={{ ...breakdown, fx: null }} totalReturn={2.084} />)

    expect(screen.queryByText("Contribution du change")).toBeNull()
    expect(screen.queryByText("= Rendement en devise locale")).toBeNull()
    expect(screen.getByText("= Rendement en EUR")).toBeTruthy()
})

test("le tableau liste les dividendes du plus récent au plus ancien avec le total", () => {
    inFrench(
        <DividendsTable
            total="91.30"
            events={[
                { date: "2026-02-13", symbol: "AAPL", amount: 39.6, quantity: 0.207 },
                { date: "2026-05-13", symbol: "MSFT", amount: 51.7, quantity: 0.198 },
            ]}
        />,
    )

    const rows = screen.getAllByRole("row").map((row) => row.textContent ?? "")
    expect(rows[1]).toContain("MSFT")
    expect(rows[2]).toContain("AAPL")
    expect(screen.getByText(/en 2 versements/)).toBeTruthy()
})
