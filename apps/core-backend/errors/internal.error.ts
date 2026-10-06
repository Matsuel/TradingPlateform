import AppError from "../models/error.model";

class InternalError extends AppError {
    constructor(message = "Internal server error", data?: Record<string, unknown>) {
        super(message, 500, data);
    }
}

export default InternalError;