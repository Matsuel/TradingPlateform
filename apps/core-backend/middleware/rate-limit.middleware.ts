import { rateLimit } from "express-rate-limit";
import { AUTH_RATE_LIMIT, BACKTEST_CREATE_RATE_LIMIT, RATE_LIMIT_WINDOW_MS } from "../constants/http.constants";

const base = { windowMs: RATE_LIMIT_WINDOW_MS, standardHeaders: "draft-7", legacyHeaders: false } as const;

/** Limite les appels à `/api/auth` (connexion, inscription). */
export const authRateLimit = rateLimit({ ...base, limit: AUTH_RATE_LIMIT });

/** Limite les créations et relances de backtest (`POST`) ; les lectures ne sont pas comptées. */
export const backtestCreateRateLimit = rateLimit({
    ...base,
    limit: BACKTEST_CREATE_RATE_LIMIT,
    skip: (req) => req.method !== "POST",
});
