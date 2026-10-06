import type { NextFunction, Request, Response } from "express";
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
            ...(err.data ?? {}),
        });
    }
    res.status(500).json({ error: "Internal server error" });
}

export default errorMiddleware;