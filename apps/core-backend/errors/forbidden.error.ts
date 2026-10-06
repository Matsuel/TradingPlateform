import AppError from "../models/error.model";

class ForbiddenError extends AppError {
  constructor(message = "Forbidden", data?: Record<string, unknown>) {
    super(message, 403, data);
  }
}

export default ForbiddenError;