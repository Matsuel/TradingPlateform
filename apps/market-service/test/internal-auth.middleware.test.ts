import { expect, test } from "bun:test"
import type { Request, Response } from "express"
import { INTERNAL_KEY_HEADER } from "@azimut/contracts"
import internalAuthMiddleware from "../middleware/internal-auth.middleware"
import { env } from "../env"

// Requête portant (ou non) la clé ; renvoie ce que `next` a reçu
function call(key?: string) {
    const req = { header: (name: string) => (name === INTERNAL_KEY_HEADER ? key : undefined) } as unknown as Request
    let received: unknown = "not called"
    internalAuthMiddleware(req, {} as Response, (error?: unknown) => {
        received = error
    })
    return received
}

test("la clé interne exacte laisse passer la requête", () => {
    expect(call(env.INTERNAL_API_KEY)).toBeUndefined()
})

test("sans clé, avec une mauvaise clé ou une clé de longueur différente : 401", () => {
    for (const key of [undefined, "", "x".repeat(env.INTERNAL_API_KEY.length), "court"]) {
        expect(call(key)).toMatchObject({ statusCode: 401 })
    }
})
