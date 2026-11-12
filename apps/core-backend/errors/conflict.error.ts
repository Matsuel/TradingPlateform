import { API_ERROR_MESSAGES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class ConflictError extends AppError {
    constructor(code: ApiErrorCode, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 409, data);
    }
}

export default ConflictError;
