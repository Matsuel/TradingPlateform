import type { NextFunction, Request, RequestHandler, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Logger } from "@trading-plateform/utils";
import BadGatewayError from "../errors/badgateway.error";

const logger = Logger.here();

/**
 * Relaie la requête vers un microservice. À monter avant express.json() pour garder le body intact.
 */
const proxyTo = (target: string): RequestHandler => {
    // Les erreurs réseau arrivent par l'événement `error`, hors chaîne Express :
    // on garde le `next` de chaque requête pour y renvoyer l'erreur.
    const nextByRequest = new WeakMap<Request, NextFunction>();

    const proxy = createProxyMiddleware<Request, Response>({
        target,
        changeOrigin: true,
        proxyTimeout: 10_000,
        on: {
            proxyReq: (proxyReq, req) => {
                // Anti-spoofing : seule l'identité vérifiée par authMiddleware est transmise.
                proxyReq.removeHeader("x-user-id");
                if (req.userId) proxyReq.setHeader("x-user-id", req.userId);

                logger.info(`Proxying ${req.method} ${req.originalUrl} to ${target}`, { userId: req.userId });
            },
            proxyRes: (proxyRes, req) => {
                logger.info(`Service responded ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
            },
            // Fournir ce handler désactive aussi la réponse texte par défaut de la lib.
            error: (err, req) => {
                logger.error(`Service unreachable ${req.method} ${req.originalUrl} (${target})`, { code: (err as NodeJS.ErrnoException).code, error: err.message });

                const next = nextByRequest.get(req);
                nextByRequest.delete(req);
                next?.(new BadGatewayError());
            },
        },
    });

    return (req, res, next) => {
        nextByRequest.set(req, next);
        return proxy(req, res, next);
    };
};

export default proxyTo;
