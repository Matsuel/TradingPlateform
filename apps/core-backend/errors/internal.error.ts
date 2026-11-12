import { API_ERROR_CODES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class InternalError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR, message = "Internal server error", data?: Record<string, unknown>) {
        super(code, message, 500, data);
    }
}

export default InternalError;
