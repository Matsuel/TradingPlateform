import { afterEach, expect, spyOn, test } from "bun:test"
import type { NextFunction, Request, Response } from "express"
import { UnauthorizedError } from "@trading-plateform/http"
import { auth } from "../lib/auth"
import authMiddleware from "../middleware/auth.middleware"

const request = () => ({ headers: {} }) as unknown as Request
const response = {} as Response

const getSession = spyOn(auth.api, "getSession")
afterEach(() => getSession.mockReset())

const run = async () => {
    const calls: unknown[] = []
    const req = request()
    await authMiddleware(req, response, ((error?: unknown) => calls.push(error)) as NextFunction)
    return { req, calls }
}

test("une session valide pose userId et laisse passer", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } } as never)

    const { req, calls } = await run()

    expect(req.userId).toBe("u1")
    expect(calls).toEqual([undefined])
})

test("sans session : UnauthorizedError, userId non posé", async () => {
    getSession.mockResolvedValue(null as never)

    const { req, calls } = await run()

    expect(req.userId).toBeUndefined()
    expect(calls[0]).toBeInstanceOf(UnauthorizedError)
})

test("une erreur de better-auth est traitée comme une absence de session", async () => {
    getSession.mockRejectedValue(new Error("base indisponible"))

    const { calls } = await run()

    expect(calls[0]).toBeInstanceOf(UnauthorizedError)
})
