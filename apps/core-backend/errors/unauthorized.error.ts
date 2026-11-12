import { API_ERROR_CODES, API_ERROR_MESSAGES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class UnauthorizedError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.UNAUTHORIZED, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 401, data);
    }
}

export default UnauthorizedError;
