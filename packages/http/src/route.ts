import type { RequestHandler, Router } from "express";
import { Logger } from "@trading-plateform/utils";

const logger = Logger.here();

/** Une route d'un service : méthode, chemin Express, middlewares puis handler. */
export interface RouteDescriptor {
    method: "get" | "post" | "put" | "delete" | "patch" | "all";
    path: string;
    handler: RequestHandler;
    middlewares?: RequestHandler[];
}

/** Enregistre chaque descripteur sur `router` (middlewares avant le handler) et logge la route. */
export function registerRoutes(router: Router, routes: RouteDescriptor[]): void {
    routes.forEach((route) => {
        logger.info(`Registering route: [${route.method.toUpperCase()}] ${route.path}`);
        router[route.method](route.path, ...(route.middlewares ?? []), route.handler);
    });
}
