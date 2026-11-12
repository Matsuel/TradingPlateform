import { expect, test } from "bun:test"
import type { Request, Response } from "express"
import { AUTH_RATE_LIMIT } from "../constants/http.constants"
import { authRateLimit } from "../middleware/rate-limit.middleware"

// Appelle le limiteur `count` fois depuis la même IP ; renvoie le statut du dernier appel (200 si `next` a été appelé)
async function hit(method: string, count: number) {
    let status = 200
    for (let i = 0; i < count; i++) {
        const req = { method, ip: "203.0.113.7", app: { get: () => false }, headers: {} } as unknown as Request
        const res = {
            statusCode: 200,
            setHeader() {},
            getHeader() {},
            status(code: number) {
                status = code
                return this
            },
            send() {},
            json() {},
        } as unknown as Response
        await new Promise<void>((resolve) => {
            const done = () => resolve()
            ;(res as { send: () => void }).send = done
            authRateLimit(req, res, done)
        })
    }
    return status
}

test("les GET de /api/auth (get-session) ne sont jamais limités", async () => {
    expect(await hit("GET", AUTH_RATE_LIMIT * 3)).toBe(200)
})

test("les POST de /api/auth sont limités au-delà de AUTH_RATE_LIMIT", async () => {
    expect(await hit("POST", AUTH_RATE_LIMIT)).toBe(200)
    expect(await hit("POST", 1)).toBe(429)
})
