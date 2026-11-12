import { afterAll, beforeAll, expect, spyOn, test } from "bun:test"
import { INTERNAL_KEY_HEADER } from "@trading-plateform/contracts"
import internalAuthMiddleware from "../middleware/internal-auth.middleware"
import createMarketRoutes from "../routes/market/market.routes"
import MarketService from "../services/market.service"
import { env } from "../env"
import { startApp } from "@trading-plateform/http/testing"

const closes = spyOn(MarketService.prototype, "getDailyCloses").mockResolvedValue({ AAPL: [{ date: "2024-01-02", close: 185.64 }] })
const search = spyOn(MarketService.prototype, "searchMarket").mockResolvedValue([])

let app: Awaited<ReturnType<typeof startApp>>
beforeAll(async () => {
    // La clé interne protège toutes les routes, comme dans index.ts
    app = await startApp(createMarketRoutes().map((route) => ({ ...route, middlewares: [internalAuthMiddleware] })))
})
afterAll(async () => {
    await app.close()
    closes.mockRestore()
    search.mockRestore()
})

const withKey = { [INTERNAL_KEY_HEADER]: env.INTERNAL_API_KEY }
const closesQuery = "symbols=AAPL&start=2024-01-02T00:00:00.000Z&end=2024-01-10T00:00:00.000Z"

test("sans clé interne : 401 UNAUTHORIZED", async () => {
    const response = await app.request(`/api/market/closes?${closesQuery}`)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: "Unauthorized", code: "UNAUTHORIZED" })
})

test("GET /api/market/closes : 200 avec les séries et les symboles découpés pour le service", async () => {
    const response = await app.request(`/api/market/closes?${closesQuery}`, { headers: withKey })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ AAPL: [{ date: "2024-01-02", close: 185.64 }] })
    expect(closes.mock.calls.at(-1)).toEqual([["AAPL"], new Date("2024-01-02T00:00:00.000Z"), new Date("2024-01-10T00:00:00.000Z")])
})

test("GET /api/market/closes invalide : 400 INVALID_QUERY", async () => {
    const response = await app.request("/api/market/closes?symbols=AAPL", { headers: withKey })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: "INVALID_QUERY" })
})

test("GET /api/market/search trop court : 400 INVALID_QUERY, sinon 200", async () => {
    expect((await app.request("/api/market/search?query=a", { headers: withKey })).status).toBe(400)
    expect((await app.request("/api/market/search?query=apple", { headers: withKey })).status).toBe(200)
})
