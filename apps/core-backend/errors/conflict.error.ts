import type { ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class ConflictError extends AppError {
    constructor(code: ApiErrorCode, message = "Conflict", data?: Record<string, unknown>) {
        super(code, message, 409, data);
    }
}

export default ConflictError;
