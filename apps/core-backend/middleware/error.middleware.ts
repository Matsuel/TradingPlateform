import type { NextFunction, Request, Response } from "express";
import { API_ERROR_CODES } from "@trading-plateform/contracts";
import AppError from "../models/error.model";


const errorMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            ...(err.data ?? {}),
        });
    }
    res.status(500).json({ error: "Internal server error", code: API_ERROR_CODES.INTERNAL_ERROR });
}

export default errorMiddleware;