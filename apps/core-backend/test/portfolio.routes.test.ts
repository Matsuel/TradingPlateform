import { afterAll, beforeAll, expect, spyOn, test } from "bun:test"
import { ForbiddenError } from "@azimut/http"
import { auth } from "../lib/auth"
import createPortfolioRoutes from "../routes/portfolio/portfolio.routes"
import PortfolioService from "../services/portfolio.service"
import { startApp } from "@azimut/http/testing"

const spies = [
    spyOn(auth.api, "getSession").mockImplementation((async () => ({ user: { id: "u1" } })) as never),
    spyOn(PortfolioService.prototype, "create").mockResolvedValue({ id: "p1" } as never),
    spyOn(PortfolioService.prototype, "getById").mockRejectedValue(new ForbiddenError()),
]

let app: Awaited<ReturnType<typeof startApp>>
beforeAll(async () => {
    app = await startApp(createPortfolioRoutes())
})
afterAll(async () => {
    await app.close()
    spies.forEach((spy) => spy.mockRestore())
})

test("POST /api/portfolio sans nom : 400 NAME_REQUIRED", async () => {
    const response = await app.request("/api/portfolio", { method: "POST", body: JSON.stringify({}) })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: "NAME_REQUIRED" })
})

test("POST /api/portfolio avec un nom : 201", async () => {
    const response = await app.request("/api/portfolio", { method: "POST", body: JSON.stringify({ name: "Principal" }) })

    expect(response.status).toBe(201)
})

test("GET /api/portfolio/:id d'un autre utilisateur : 403 ACCESS_DENIED", async () => {
    const response = await app.request("/api/portfolio/p1")

    expect(response.status).toBe(403)
    expect(await response.json()).toMatchObject({ code: "ACCESS_DENIED" })
})
