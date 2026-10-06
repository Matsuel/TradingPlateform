import type { RequestHandler } from "express";

export interface RouteDescriptor {
    method: "get" | "post" | "put" | "delete" | "patch" | "all";
    path: string;
    handler: RequestHandler;
    middlewares?: RequestHandler[];
}