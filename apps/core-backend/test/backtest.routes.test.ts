import { afterAll, beforeAll, beforeEach, expect, spyOn, test } from "bun:test"
import { ConflictError, NotFoundError } from "@trading-plateform/http"
import { API_ERROR_CODES } from "@trading-plateform/contracts"
import { auth } from "../lib/auth"
import createBacktestRoutes from "../routes/backtest/backtest.routes"
import BacktestService from "../services/backtest.service"
import { startApp } from "@trading-plateform/http/testing"

// Session better-auth simulée : `signedIn` décide si la requête a un utilisateur
let signedIn = true
const spies = [
    spyOn(auth.api, "getSession").mockImplementation((async () => (signedIn ? { user: { id: "u1" } } : null)) as never),
]
const service = BacktestService.prototype
const rerun = spyOn(service, "rerun")
const getById = spyOn(service, "getById")
const create = spyOn(service, "create")
spies.push(rerun as never, getById as never, create as never)

let app: Awaited<ReturnType<typeof startApp>>
beforeAll(async () => {
    app = await startApp(createBacktestRoutes())
})
afterAll(async () => {
    await app.close()
    // Les espions sont globaux au process : rendus aux autres fichiers de test
    spies.forEach((spy) => spy.mockRestore())
})
beforeEach(() => {
    signedIn = true
    rerun.mockReset()
    getById.mockReset()
    create.mockReset()
})

const validBody = {
    name: "Test",
    investmentMode: "LUMP_SUM",
    allocations: [{ symbol: "AAPL", weight: 100 }],
    start: "2024-01-01",
    end: "2024-12-31",
    initialAmount: 1000,
    fee: 0.1,
}

test("sans session : 401 UNAUTHORIZED sur chaque route protégée", async () => {
    signedIn = false

    for (const [method, path] of [["GET", "/api/backtest"], ["GET", "/api/backtest/stats"], ["POST", "/api/backtest/b1/executions"]] as const) {
        const response = await app.request(path, { method })
        expect(response.status).toBe(401)
        expect(await response.json()).toMatchObject({ code: "UNAUTHORIZED" })
    }
})

test("POST /api/backtest avec un body invalide : 400 INVALID_BACKTEST et issues avec leur code", async () => {
    const response = await app.request("/api/backtest", {
        method: "POST",
        body: JSON.stringify({ ...validBody, start: "2024-12-31", end: "2024-01-01" }),
    })

    expect(response.status).toBe(400)
    const body = (await response.json()) as { code: string; issues: { path: string[]; params?: { code: string } }[] }
    expect(body.code).toBe("INVALID_BACKTEST")
    expect(body.issues.find((issue) => issue.params?.code === "END_BEFORE_START")?.path).toEqual(["end"])
    expect(create).not.toHaveBeenCalled()
})

test("POST /api/backtest valide : 202 et le service reçoit l'utilisateur et les poids en ratios", async () => {
    create.mockResolvedValue({ id: "b1" } as never)

    const response = await app.request("/api/backtest", { method: "POST", body: JSON.stringify(validBody) })

    expect(response.status).toBe(202)
    expect(await response.json()).toEqual({ id: "b1" })
    expect(create.mock.calls[0]![0]).toBe("u1")
    expect(create.mock.calls[0]![1].allocations).toEqual([{ symbol: "AAPL", weight: 1 }])
})

test("GET /api/backtest?status=FOO : 400 INVALID_QUERY", async () => {
    const response = await app.request("/api/backtest?status=FOO")

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: "INVALID_QUERY" })
})

test("GET /api/backtest/:id : l'erreur du service devient 404 BACKTEST_NOT_FOUND", async () => {
    getById.mockRejectedValue(new NotFoundError(API_ERROR_CODES.BACKTEST_NOT_FOUND))

    const response = await app.request("/api/backtest/inconnu")

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "Backtest not found", code: "BACKTEST_NOT_FOUND" })
})

test("POST /api/backtest/:id/executions : 409 avec l'id de l'exécution active, 202 sinon", async () => {
    rerun.mockRejectedValueOnce(new ConflictError(API_ERROR_CODES.EXECUTION_IN_PROGRESS, { executionId: "e1" }))
    const conflict = await app.request("/api/backtest/b1/executions", { method: "POST" })
    expect(conflict.status).toBe(409)
    expect(await conflict.json()).toMatchObject({ code: "EXECUTION_IN_PROGRESS", executionId: "e1" })

    rerun.mockResolvedValueOnce({ id: "e2", attempt: 2 } as never)
    const accepted = await app.request("/api/backtest/b1/executions", { method: "POST" })
    expect(accepted.status).toBe(202)
    expect(await accepted.json()).toMatchObject({ id: "e2" })
})

test("GET /api/backtest/compare : ids identiques refusés (400), deux ids distincts transmis au service", async () => {
    const compare = spyOn(service, "compare").mockResolvedValue({ ok: true } as never)
    spies.push(compare as never)

    const same = await app.request("/api/backtest/compare?ids=a,a")
    expect(same.status).toBe(400)
    expect(await same.json()).toMatchObject({ code: "INVALID_QUERY" })

    const distinct = await app.request("/api/backtest/compare?ids=a,b")
    expect(distinct.status).toBe(200)
    expect(compare.mock.calls[0]![1]).toEqual({ ids: ["a", "b"] })
})
