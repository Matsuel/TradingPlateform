class AppError extends Error {
    constructor(
        public override message: string,
        public statusCode: number,
        public data?: Record<string, unknown>
    ) {
        super(message);
    }
}

export default AppError;