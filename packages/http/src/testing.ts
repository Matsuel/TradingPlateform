import express from "express"
import type { Server } from "node:http"
import { errorMiddleware } from "./error.middleware"
import { registerRoutes, type RouteDescriptor } from "./route"

/**
 * Aide de test des apps (`@trading-plateform/http/testing`) : démarre un vrai serveur Express (port libre) avec ces routes puis `errorMiddleware`, comme `index.ts`.
 * `request(path, init)` appelle le serveur ; `close()` l'arrête.
 */
export async function startApp(routes: RouteDescriptor[]) {
    const app = express()
    app.use(express.json())
    const router = express.Router()
    registerRoutes(router, routes)
    app.use(router)
    app.use(errorMiddleware)

    const server: Server = await new Promise((resolve) => {
        const listening = app.listen(0, () => resolve(listening))
    })
    const { port } = server.address() as { port: number }

    return {
        request: (path: string, init?: RequestInit) =>
            fetch(`http://localhost:${port}${path}`, {
                ...init,
                headers: { "content-type": "application/json", ...init?.headers },
            }),
        close: () => new Promise<void>((resolve) => server.close(() => resolve())),
    }
}
