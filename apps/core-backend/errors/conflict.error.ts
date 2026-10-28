import AppError from "../models/error.model";

class ConflictError extends AppError {
    constructor(message = "Conflict", data?: Record<string, unknown>) {
        super(message, 409, data);
    }
}

export default ConflictError;
