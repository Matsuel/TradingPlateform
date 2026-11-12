import { API_ERROR_CODES, type ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class BadGatewayError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.SERVICE_UNAVAILABLE, message = "Service unavailable", data?: Record<string, unknown>) {
        super(code, message, 502, data);
    }
}

export default BadGatewayError;
