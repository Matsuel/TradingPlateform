import { afterAll, beforeAll, expect, test } from "bun:test"
import { startApp } from "@trading-plateform/http/testing"
import createMarketRoutes from "../routes/market/market.routes"

let app: Awaited<ReturnType<typeof startApp>>
beforeAll(async () => {
    app = await startApp(createMarketRoutes())
})
afterAll(() => app.close())

test("le proxy ne relaie que les routes lues par le web", () => {
    expect(createMarketRoutes().map((route) => `${route.method} ${route.path}`)).toEqual([
        "get /api/market/search",
        "get /api/market/details/:id",
        "get /api/market/defaults",
    ])
})

test("/api/market/closes, réservée à l'engine, n'est pas relayée (404)", async () => {
    const response = await app.request("/api/market/closes?symbols=AAPL&start=2024-01-02T00:00:00.000Z&end=2024-01-10T00:00:00.000Z")

    expect(response.status).toBe(404)
})
