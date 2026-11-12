import { API_ERROR_CODES, API_ERROR_MESSAGES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class InternalError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 500, data);
    }
}

export default InternalError;
