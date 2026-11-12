// Codes d'erreur stables de core-backend : renvoyés dans `code` du corps d'erreur et, pour une issue de validation,
// dans `params.code` ; le web les traduit via `errors.<code>`. Le message anglais (`error`) ne sert qu'aux logs.
export const API_ERROR_CODES = {
    // Erreurs d'une requête
    UNAUTHORIZED: "UNAUTHORIZED",
    ACCESS_DENIED: "ACCESS_DENIED",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    INVALID_QUERY: "INVALID_QUERY",
    INVALID_BACKTEST: "INVALID_BACKTEST",
    NAME_REQUIRED: "NAME_REQUIRED",
    PORTFOLIO_NOT_FOUND: "PORTFOLIO_NOT_FOUND",
    BACKTEST_NOT_FOUND: "BACKTEST_NOT_FOUND",
    BACKTEST_NO_RESULT: "BACKTEST_NO_RESULT",
    EXECUTION_IN_PROGRESS: "EXECUTION_IN_PROGRESS",
    BACKTEST_QUEUE_FAILED: "BACKTEST_QUEUE_FAILED",
    // Issues de validation personnalisées (refine)
    SYMBOLS_NOT_UNIQUE: "SYMBOLS_NOT_UNIQUE",
    WEIGHTS_NOT_100: "WEIGHTS_NOT_100",
    END_BEFORE_START: "END_BEFORE_START",
    RECURRING_AMOUNT_REQUIRED: "RECURRING_AMOUNT_REQUIRED",
    RECURRING_AMOUNT_NOT_ALLOWED: "RECURRING_AMOUNT_NOT_ALLOWED",
    INITIAL_AMOUNT_NOT_POSITIVE: "INITIAL_AMOUNT_NOT_POSITIVE",
    IDS_NOT_DISTINCT: "IDS_NOT_DISTINCT",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// Message anglais de chaque code, pour les logs et le champ `error` : l'utilisateur lit la traduction du code, pas ce texte
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
    UNAUTHORIZED: "Unauthorized",
    ACCESS_DENIED: "Access denied",
    SERVICE_UNAVAILABLE: "Service unavailable",
    INTERNAL_ERROR: "Internal server error",
    INVALID_QUERY: "Invalid query",
    INVALID_BACKTEST: "Invalid backtest",
    NAME_REQUIRED: "Name is required",
    PORTFOLIO_NOT_FOUND: "Portfolio not found",
    BACKTEST_NOT_FOUND: "Backtest not found",
    BACKTEST_NO_RESULT: "Backtest has no completed result",
    EXECUTION_IN_PROGRESS: "An execution is already in progress",
    BACKTEST_QUEUE_FAILED: "Backtest could not be queued",
    SYMBOLS_NOT_UNIQUE: "Symbols must be unique",
    WEIGHTS_NOT_100: "Weights must sum to 100",
    END_BEFORE_START: "Must be after start",
    RECURRING_AMOUNT_REQUIRED: "Required for RECURRING",
    RECURRING_AMOUNT_NOT_ALLOWED: "Only allowed for RECURRING",
    INITIAL_AMOUNT_NOT_POSITIVE: "Must be positive for LUMP_SUM",
    IDS_NOT_DISTINCT: "Ids must be distinct",
};
