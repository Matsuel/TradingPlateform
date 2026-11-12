import { expect, test } from "bun:test"
import { ApiError, apiIssues } from "../src/lib/api"

test("ApiError expose le code stable du corps d'erreur", () => {
    const error = new ApiError(404, "Not Found", { error: "Backtest not found", code: "BACKTEST_NOT_FOUND" })

    expect(error.status).toBe(404)
    expect(error.code).toBe("BACKTEST_NOT_FOUND")
})

test("sans code dans le corps (erreur relayée, corps non JSON), code vaut null", () => {
    expect(new ApiError(502, "Bad Gateway", { error: "x" }).code).toBeNull()
    expect(new ApiError(500, "Server Error", null).code).toBeNull()
})

test("apiIssues renvoie chemin et code d'un 400, ignore la racine et les autres erreurs", () => {
    const body = {
        error: "Invalid backtest",
        code: "INVALID_BACKTEST",
        issues: [
            { code: "custom", path: ["end"], params: { code: "END_BEFORE_START" }, message: "Must be after start" },
            { code: "too_small", path: ["allocations", 0, "weight"], message: "Too small" },
            { code: "custom", path: [], message: "racine" },
        ],
    }

    expect(apiIssues(new ApiError(400, "Bad Request", body))).toEqual([
        { path: "end", code: "END_BEFORE_START" },
        { path: "allocations.0.weight", code: null },
    ])
    expect(apiIssues(new ApiError(404, "Not Found", body))).toEqual([])
    expect(apiIssues(new Error("réseau"))).toEqual([])
})
