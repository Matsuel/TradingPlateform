import { afterAll, beforeAll, expect, test } from "bun:test"
import express from "express"
import type { Server } from "node:http"
import { INTERNAL_KEY_HEADER } from "@trading-plateform/contracts"
import { errorMiddleware } from "@trading-plateform/http"
import { env } from "../env"
import proxyTo from "../utils/proxy"

// Faux microservice : renvoie les en-têtes qu'il a reçus
let upstream: Server
let upstreamPort: number
let gateway: Server
let gatewayPort: number
let deadGateway: Server
let deadGatewayPort: number

const listen = (app: express.Express) =>
    new Promise<Server>((resolve) => {
        const server = app.listen(0, () => resolve(server))
    })
const portOf = (server: Server) => (server.address() as { port: number }).port

beforeAll(async () => {
    const service = express()
    service.get("/echo", (req, res) => res.json({ headers: req.headers }))
    upstream = await listen(service)
    upstreamPort = portOf(upstream)

    const withUser = (userId?: string): express.RequestHandler => (req, _res, next) => {
        if (userId) req.userId = userId
        next()
    }

    const live = express()
    live.use(withUser("verified-user"), proxyTo(`http://localhost:${upstreamPort}`), errorMiddleware)
    gateway = await listen(live)
    gatewayPort = portOf(gateway)

    // Cible fermée : le port du faux service, une fois arrêté
    const closed = await listen(express())
    const closedPort = portOf(closed)
    await new Promise<void>((resolve) => closed.close(() => resolve()))
    const dead = express()
    dead.use(proxyTo(`http://localhost:${closedPort}`), errorMiddleware)
    deadGateway = await listen(dead)
    deadGatewayPort = portOf(deadGateway)
})

afterAll(async () => {
    await Promise.all([upstream, gateway, deadGateway].map((server) => new Promise<void>((resolve) => server.close(() => resolve()))))
})

test("le proxy ajoute la clé interne et l'identité vérifiée", async () => {
    const body = (await (await fetch(`http://localhost:${gatewayPort}/echo`)).json()) as { headers: Record<string, string> }

    expect(body.headers[INTERNAL_KEY_HEADER.toLowerCase()]).toBe(env.INTERNAL_API_KEY)
    expect(body.headers["x-user-id"]).toBe("verified-user")
})

test("un x-user-id envoyé par le client est écrasé par l'identité vérifiée", async () => {
    const response = await fetch(`http://localhost:${gatewayPort}/echo`, { headers: { "x-user-id": "usurpateur" } })
    const body = (await response.json()) as { headers: Record<string, string> }

    expect(body.headers["x-user-id"]).toBe("verified-user")
})

test("un microservice injoignable donne une 502", async () => {
    const response = await fetch(`http://localhost:${deadGatewayPort}/echo`)

    expect(response.status).toBe(502)
})
