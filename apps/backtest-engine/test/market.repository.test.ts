import { afterEach, expect, test } from "bun:test"
import MarketRepository from "../repositories/market.repository"

const realFetch = globalThis.fetch
afterEach(() => {
    globalThis.fetch = realFetch
})

// Remplace fetch ; `calls` garde l'URL et les en-têtes de chaque appel
function stubFetch(respond: () => Response) {
    const calls: { url: string; headers: Headers }[] = []
    globalThis.fetch = (async (input: URL, init?: RequestInit) => {
        calls.push({ url: String(input), headers: new Headers(init?.headers) })
        return respond()
    }) as unknown as typeof fetch
    return calls
}

const start = new Date("2024-01-02T00:00:00.000Z")
const end = new Date("2024-01-10T00:00:00.000Z")

test("lit les cours auprès de market-service avec la clé interne", async () => {
    const calls = stubFetch(() => Response.json({ AAA: [{ date: "2024-01-02", close: 10.5 }], BBB: [] }))

    const prices = await new MarketRepository().getDailyCloses(["AAA", "BBB"], start, end)

    expect(prices).toEqual({ AAA: [{ date: "2024-01-02", close: 10.5 }], BBB: [] })
    const url = new URL(calls[0]!.url)
    expect(url.pathname).toBe("/api/market/closes")
    expect(url.searchParams.get("symbols")).toBe("AAA,BBB")
    expect(url.searchParams.get("start")).toBe("2024-01-02T00:00:00.000Z")
    expect(url.searchParams.get("end")).toBe("2024-01-10T00:00:00.000Z")
    expect(calls[0]!.headers.get("x-internal-key")).toBe(process.env.INTERNAL_API_KEY!)
})

test("une réponse hors 2xx lève une erreur avec son code (le service publie alors backtest.failed)", async () => {
    const calls = stubFetch(() => Response.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 }))

    await expect(new MarketRepository().getDailyCloses(["AAA"], start, end)).rejects.toThrow("market-service responded 500 INTERNAL_ERROR")
    // Un 500 (symbole inconnu) ne se rejoue pas
    expect(calls).toHaveLength(1)
})

test("un 503 puis un succès : une seconde tentative réussit", async () => {
    let attempt = 0
    const calls = stubFetch(() => (++attempt === 1 ? new Response("down", { status: 503 }) : Response.json({ AAA: [] })))

    expect(await new MarketRepository().getDailyCloses(["AAA"], start, end)).toEqual({ AAA: [] })
    expect(calls).toHaveLength(2)
})

test("market-service injoignable deux fois de suite : l'erreur remonte après deux tentatives", async () => {
    let attempts = 0
    globalThis.fetch = (async () => {
        attempts++
        throw new TypeError("fetch failed")
    }) as unknown as typeof fetch

    await expect(new MarketRepository().getDailyCloses(["AAA"], start, end)).rejects.toThrow("fetch failed")
    expect(attempts).toBe(2)
})

test("une réponse qui ne respecte pas le contrat est refusée", async () => {
    stubFetch(() => Response.json({ AAA: [{ date: "pas-une-date", close: "x" }] }))

    expect(new MarketRepository().getDailyCloses(["AAA"], start, end)).rejects.toThrow()
})
