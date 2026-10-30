import type { Router } from "express";
import type { RouteDescriptor } from "../models/route.model";
import { Logger } from "@trading-plateform/utils";

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