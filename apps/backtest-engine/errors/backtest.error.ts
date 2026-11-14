import type { ExecutionErrorCode } from "@azimut/contracts";

class BacktestError extends Error {
    constructor(
        readonly code: ExecutionErrorCode,
        message: string,
    ) {
        super(message);
        this.name = "BacktestError";
    }
}

export default BacktestError;
