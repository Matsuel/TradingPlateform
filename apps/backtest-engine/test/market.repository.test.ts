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

test("une réponse hors 2xx lève une erreur (le service publie alors backtest.failed)", async () => {
    stubFetch(() => new Response("boom", { status: 500 }))

    expect(new MarketRepository().getDailyCloses(["AAA"], start, end)).rejects.toThrow("market-service responded 500")
})

test("une réponse qui ne respecte pas le contrat est refusée", async () => {
    stubFetch(() => Response.json({ AAA: [{ date: "pas-une-date", close: "x" }] }))

    expect(new MarketRepository().getDailyCloses(["AAA"], start, end)).rejects.toThrow()
})
