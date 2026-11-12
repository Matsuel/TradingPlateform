import { API_ERROR_CODES, API_ERROR_MESSAGES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class ForbiddenError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.ACCESS_DENIED, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 403, data);
    }
}

export default ForbiddenError;
