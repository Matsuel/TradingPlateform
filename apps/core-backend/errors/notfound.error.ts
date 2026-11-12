import type { ApiErrorCode } from "@trading-plateform/contracts";
import AppError from "../models/error.model";

class NotFoundError extends AppError {
    constructor(code: ApiErrorCode, message = "Not found", data?: Record<string, unknown>) {
        super(code, message, 404, data);
    }
}

export default NotFoundError;
