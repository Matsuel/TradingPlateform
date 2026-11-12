import { API_ERROR_CODES, API_ERROR_MESSAGES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class BadGatewayError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.SERVICE_UNAVAILABLE, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 502, data);
    }
}

export default BadGatewayError;
