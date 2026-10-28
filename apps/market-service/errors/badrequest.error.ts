import AppError from "../models/error.model";

class BadRequestError extends AppError {
  constructor(message = "Bad request", data?: Record<string, unknown>) {
    super(message, 400, data);
  }
}

export default BadRequestError;