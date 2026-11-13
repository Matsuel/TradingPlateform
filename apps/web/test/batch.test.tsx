import { afterEach, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"
import fr from "../messages/fr.json"
import { BacktestBatchView } from "../src/features/backtest/batch/backtest-batch"
import { BatchStats } from "../src/features/backtest/batch/batch-stats"
import { StartDates } from "../src/features/backtest/form/start-dates"
import type { BacktestBatch } from "../src/features/backtest/types"
import { startDateIssue } from "../src/features/backtest/utils"

afterEach(cleanup)

const inFrench = (node: ReactNode) =>
    render(
        <NextIntlClientProvider locale="fr" messages={fr}>
            {node}
        </NextIntlClientProvider>,
    )

const end = new Date(2026, 5, 30)

const batch = {
    batchId: "l1",
    name: "Portefeuille A",
    endDate: end.toISOString(),
    status: "COMPLETED",
    rows: Array.from({ length: 6 }, (_, i) => ({ backtestId: `b${i}` })),
    summary: {
        medianCagr: 0.104,
        cagrSpread: 0.062,
        worstStart: { startDate: new Date(2022, 0, 1).toISOString(), cagr: 0.061 },
        window: { years: 3, worst: -0.041, worstDate: "2022-01-03", negativeShare: 0.08, count: 1870 },
    },
    rollingSummary: null,
} as unknown as BacktestBatch

test("les quatre cartes affichent les valeurs de la synthèse du lot, telles que reçues", () => {
    inFrench(<BatchStats batch={batch} />)

    for (const text of [
        "CAGR médian",
        "6 départs",
        "Pire départ",
        "2022",
        "Pire fenêtre 3 ans",
        "par an",
        "Fenêtres négatives",
        "3 ans",
    ])
        expect(screen.getByText(text)).toBeTruthy()
    expect(screen.getByText(/Écart pire–meilleur/)).toBeTruthy()
    expect(screen.getByText(/Entrée au/)).toBeTruthy()
    expect(screen.getByText(/1\s?870 fenêtres glissantes/)).toBeTruthy()
})

test("sans synthèse (aucun départ terminé), les cartes affichent des tirets", () => {
    inFrench(<BatchStats batch={{ ...batch, summary: null }} />)

    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(4)
})

test("startDateIssue : manquante, doublon, moins d'un an avant la fin", () => {
    const dates = [new Date(2016, 0, 1), new Date(2016, 0, 1), new Date(2025, 11, 31), undefined, new Date(2025, 5, 30)]

    expect(startDateIssue(dates, 0, end)).toBe("duplicate")
    expect(startDateIssue(dates, 2, end)).toBe("tooClose")
    expect(startDateIssue(dates, 3, end)).toBe("required")
    // Exactement un an avant la fin : admis
    expect(startDateIssue(dates, 4, end)).toBeNull()
})

test("les départs affichent « Départ n », le compteur, le refus d'un départ trop proche de la fin et la limite de 10 dates", () => {
    const dates = [new Date(2016, 0, 1), new Date(2026, 2, 15)]
    inFrench(<StartDates dates={dates} end={end} onChange={() => {}} />)

    expect(screen.getByText("Départ 1")).toBeTruthy()
    expect(screen.getByText("Départ 2")).toBeTruthy()
    expect(screen.getByText("2 / 10 dates")).toBeTruthy()
    expect(screen.getByText(/Refusé : moins d’un an avant la fin commune \(30\/06\/2026\)/)).toBeTruthy()
    cleanup()

    inFrench(
        <StartDates
            dates={Array.from({ length: 10 }, (_, i) => new Date(2010 + i, 0, 1))}
            end={end}
            onChange={() => {}}
        />,
    )
    expect((screen.getByText("Ajouter une date") as HTMLButtonElement).closest("button")?.disabled).toBe(true)
})

const push = mock()
mock.module("next/navigation", () => ({ useRouter: () => ({ push }) }))

const view = (data: BacktestBatch) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    client.setQueryData(["backtest", "batch", data.batchId], data)
    return inFrench(
        <QueryClientProvider client={client}>
            <BacktestBatchView batchId={data.batchId} />
        </QueryClientProvider>,
    )
}

const startRow = (i: number) => ({
    backtestId: `b${i}`,
    startDate: new Date(2016 + i, 0, 1).toISOString(),
    status: "COMPLETED" as const,
    result: {
        finalValue: "30480",
        cagr: "0.112",
        volatility: "0.158",
        sharpeRatio: "0.7",
        maxDrawdown: "-0.241",
        totalReturn: "2.048",
    },
    rank: null,
})

test("la page du lot affiche synthèse, une ligne par départ et fenêtres indisponibles sans résumé glissant", () => {
    view({ ...batch, rows: [startRow(0), startRow(1)] } as unknown as BacktestBatch)

    expect(screen.getByText("Robustesse · Portefeuille A")).toBeTruthy()
    expect(screen.getByText("Résultats par date de départ")).toBeTruthy()
    expect(screen.getByText("CAGR médian")).toBeTruthy()
    expect(screen.getByText("Relancer le lot")).toBeTruthy()
    expect(screen.getByText(/Fenêtres glissantes indisponibles/)).toBeTruthy()
    expect(screen.getAllByText(/11,2/).length).toBeGreaterThanOrEqual(2)
})

test("un lot en cours ne peut pas être relancé", () => {
    view({
        ...batch,
        status: "RUNNING",
        rows: [{ ...startRow(0), status: "RUNNING", result: null }, startRow(1)],
    } as unknown as BacktestBatch)

    expect((screen.getByText("Relancer le lot").closest("button") as HTMLButtonElement).disabled).toBe(true)
})
