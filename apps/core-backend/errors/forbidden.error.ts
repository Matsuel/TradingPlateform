import { API_ERROR_CODES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class ForbiddenError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.ACCESS_DENIED, message = "Access denied", data?: Record<string, unknown>) {
        super(code, message, 403, data);
    }
}

export default ForbiddenError;