import { afterEach, expect, spyOn, test } from "bun:test"
import { BadGatewayError } from "@azimut/http"
import MarketRepository from "../repositories/market.repository"

// Client yahoo-finance2 privé de la classe : simulé pour ne faire aucun appel réseau
const yahoo = (MarketRepository as unknown as { yahooFinance: { chart: (...args: unknown[]) => Promise<unknown> } }).yahooFinance
const start = new Date("2024-01-01T00:00:00Z")
const end = new Date("2024-12-31T00:00:00Z")

let chartSpy: ReturnType<typeof spyOn> | undefined
const mockChart = (chart: unknown) => {
    chartSpy = spyOn(yahoo, "chart").mockResolvedValue(chart)
}

afterEach(() => chartSpy?.mockRestore())

test("getDailyCloses lit le jour de cotation dans le fuseau de la place et écarte les jours sans clôture", async () => {
    mockChart({
        meta: { exchangeTimezoneName: "Asia/Tokyo", currency: "JPY" },
        quotes: [
            // 15:00 UTC le 4 janvier = 00:00 le 5 à Tokyo
            { date: new Date("2024-01-04T15:00:00Z"), close: 100 },
            { date: new Date("2024-01-05T15:00:00Z"), close: null },
        ],
    })

    const closes = await new MarketRepository().getDailyCloses(["7203.T"], start, end)

    expect(closes).toEqual({ "7203.T": [{ date: "2024-01-05", close: 100 }] })
})

test("getDailyCloses ramène un cours en pence en livres", async () => {
    mockChart({
        meta: { exchangeTimezoneName: "Europe/London", currency: "GBp" },
        quotes: [{ date: new Date("2024-01-02T12:00:00Z"), close: 250 }],
    })

    const closes = await new MarketRepository().getDailyCloses(["VOD.L"], start, end)

    expect(closes["VOD.L"]).toEqual([{ date: "2024-01-02", close: 2.5 }])
})

test("getDividends lit l'ex-date dans le fuseau de la place, trie par date et convertit les pence", async () => {
    mockChart({
        meta: { exchangeTimezoneName: "Australia/Sydney", currency: "GBp" },
        quotes: [],
        events: {
            dividends: [
                { date: new Date("2024-06-10T20:00:00Z"), amount: 30 },
                { date: new Date("2024-03-04T20:00:00Z"), amount: 10 },
            ],
        },
    })

    const dividends = await new MarketRepository().getDividends(["X.L"], start, end)

    // 20:00 UTC = lendemain matin à Sydney
    expect(dividends).toEqual({
        "X.L": {
            currency: "GBP",
            dividends: [
                { date: "2024-03-05", amount: 0.1 },
                { date: "2024-06-11", amount: 0.3 },
            ],
        },
    })
})

test("getDividends rend une liste vide sans dividende", async () => {
    mockChart({ meta: { exchangeTimezoneName: "America/New_York", currency: "USD" }, quotes: [] })

    const dividends = await new MarketRepository().getDividends(["AAPL"], start, end)

    expect(dividends).toEqual({ AAPL: { currency: "USD", dividends: [] } })
})

test("getDetails sans série lève une BadGatewayError", async () => {
    mockChart(undefined)

    await expect(new MarketRepository().getDetails("AAPL", "1d")).rejects.toBeInstanceOf(BadGatewayError)
})
