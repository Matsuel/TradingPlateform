import type { ApiErrorCode } from "@trading-plateform/contracts";

class AppError extends Error {
    constructor(
        public code: ApiErrorCode,
        public override message: string,
        public statusCode: number,
        public data?: Record<string, unknown>
    ) {
        super(message);
    }
}

export default AppError;
