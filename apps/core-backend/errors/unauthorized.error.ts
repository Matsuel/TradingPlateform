import AppError from "../models/error.model";

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", data?: Record<string, unknown>) {
    super(message, 401, data);
  }
}

export default UnauthorizedError;