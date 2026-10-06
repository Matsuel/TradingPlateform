import type { Router } from "express";
import { Logger } from "../utils/logger";
import type { RouteDescriptor } from "../models/route.model";

const logger = Logger.here();

export function registerRoutes(
    router: Router,
    routes: RouteDescriptor[]
) {
    routes.forEach(route => {
        logger.info(`Registering route: [${route.method.toUpperCase()}] ${route.path}`);
        router[route.method](
            route.path,
            ...(route.middlewares ?? []),
            route.handler
        );
    });
}