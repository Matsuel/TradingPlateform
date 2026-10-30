class BacktestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BacktestError";
    }
}

export default BacktestError;
