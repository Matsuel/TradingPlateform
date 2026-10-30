import AppError from "../models/error.model";

class BadGatewayError extends AppError {
    constructor(message = "Service unavailable", data?: Record<string, unknown>) {
        super(message, 502, data);
    }
}

export default BadGatewayError;
