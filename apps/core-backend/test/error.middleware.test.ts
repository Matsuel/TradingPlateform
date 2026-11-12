import { expect, test } from "bun:test"
import type { Request, Response } from "express"
import { API_ERROR_CODES } from "@trading-plateform/contracts"
import { ConflictError, ForbiddenError, NotFoundError, errorMiddleware } from "@trading-plateform/http";

// Réponse minimale : mémorise le statut et le corps envoyés
function run(error: Error) {
    const sent: { status?: number; body?: unknown } = {}
    const res = {
        status(code: number) {
            sent.status = code
            return this
        },
        json(body: unknown) {
            sent.body = body
            return this
        },
    } as unknown as Response
    errorMiddleware(error, {} as Request, res, () => {})
    return sent
}

test("une AppError renvoie son statut, son message anglais, son code et ses données", () => {
    const sent = run(new ConflictError(API_ERROR_CODES.EXECUTION_IN_PROGRESS, { executionId: "e1" }))

    expect(sent.status).toBe(409)
    expect(sent.body).toEqual({
        error: "An execution is already in progress",
        code: "EXECUTION_IN_PROGRESS",
        executionId: "e1",
    })
})

test("ForbiddenError a ACCESS_DENIED par défaut, NotFoundError le code demandé", () => {
    expect(run(new ForbiddenError()).body).toMatchObject({ code: "ACCESS_DENIED" })
    expect(run(new NotFoundError(API_ERROR_CODES.BACKTEST_NOT_FOUND)).status).toBe(404)
})

test("une exception inattendue devient un 500 INTERNAL_ERROR sans fuite du message", () => {
    const sent = run(new Error("connection refused at 10.0.0.1"))

    expect(sent.status).toBe(500)
    expect(sent.body).toEqual({ error: "Internal server error", code: "INTERNAL_ERROR" })
})
