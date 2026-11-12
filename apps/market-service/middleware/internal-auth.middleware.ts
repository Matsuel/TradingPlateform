import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { INTERNAL_KEY_HEADER } from "@trading-plateform/contracts";
import UnauthorizedError from "../errors/unauthorized.error";
import { env } from "../env";

const expected = Buffer.from(env.INTERNAL_API_KEY);

/** Refuse (`401`) tout appel sans la clé interne de core-backend ; comparaison à temps constant. */
const internalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const received = Buffer.from(req.header(INTERNAL_KEY_HEADER) ?? "");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return next(new UnauthorizedError());
    next();
};

export default internalAuthMiddleware;
