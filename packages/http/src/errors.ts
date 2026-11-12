import { API_ERROR_CODES, API_ERROR_MESSAGES, type ApiErrorCode } from "@trading-plateform/contracts";

/** Erreur métier ou technique rendue par `errorMiddleware` en `{ error, code, ...data }` avec `statusCode`. */
export class AppError extends Error {
    constructor(
        public code: ApiErrorCode,
        public override message: string,
        public statusCode: number,
        public data?: Record<string, unknown>,
    ) {
        super(message);
    }
}

export class BadRequestError extends AppError {
    constructor(code: ApiErrorCode, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 400, data);
    }
}

export class UnauthorizedError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.UNAUTHORIZED, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 401, data);
    }
}

export class ForbiddenError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.ACCESS_DENIED, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 403, data);
    }
}

export class NotFoundError extends AppError {
    constructor(code: ApiErrorCode, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 404, data);
    }
}

export class ConflictError extends AppError {
    constructor(code: ApiErrorCode, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 409, data);
    }
}

export class InternalError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 500, data);
    }
}

export class BadGatewayError extends AppError {
    constructor(code: ApiErrorCode = API_ERROR_CODES.SERVICE_UNAVAILABLE, data?: Record<string, unknown>) {
        super(code, API_ERROR_MESSAGES[code], 502, data);
    }
}
