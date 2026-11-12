import type { NextFunction, Request, Response } from "express";
import { API_ERROR_CODES, API_ERROR_MESSAGES } from "@trading-plateform/contracts";
import { AppError } from "./errors";

/** Dernier middleware d'un service : seul endroit qui formate une réponse d'erreur (`{ error, code, ...data }`). */
export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            ...(err.data ?? {}),
        });
    }
    res.status(500).json({ error: API_ERROR_MESSAGES.INTERNAL_ERROR, code: API_ERROR_CODES.INTERNAL_ERROR });
};
