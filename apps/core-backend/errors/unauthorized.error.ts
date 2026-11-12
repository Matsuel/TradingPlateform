import { API_ERROR_CODES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class UnauthorizedError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.UNAUTHORIZED, message = "Unauthorized", data?: Record<string, unknown>) {
        super(code, message, 401, data);
    }
}

export default UnauthorizedError;
