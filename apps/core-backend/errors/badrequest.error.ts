import type { ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class BadRequestError extends AppError {
    constructor(code: ApiErrorCode, message = "Bad request", data?: Record<string, unknown>) {
        super(code, message, 400, data);
    }
}

export default BadRequestError;
