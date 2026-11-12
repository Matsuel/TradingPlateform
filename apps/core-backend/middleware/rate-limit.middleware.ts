import { rateLimit } from "express-rate-limit";
import { AUTH_RATE_LIMIT, BACKTEST_CREATE_RATE_LIMIT, RATE_LIMIT_WINDOW_MS } from "../constants/http.constants";

const base = { windowMs: RATE_LIMIT_WINDOW_MS, standardHeaders: "draft-7", legacyHeaders: false } as const;

/**
 * Limite les `POST` de `/api/auth` (connexion, inscription, changement de mot de passe). Les `GET` ne comptent pas :
 * `get-session` est appelé à chaque page par le web et épuiserait la limite en quelques clics.
 */
export const authRateLimit = rateLimit({ ...base, limit: AUTH_RATE_LIMIT, skip: (req) => req.method !== "POST" });

/** Limite les créations et relances de backtest (`POST`) ; les lectures et l'aperçu (`/preview`, appelé à chaque modification du formulaire, sans calcul) ne sont pas comptés. */
export const backtestCreateRateLimit = rateLimit({
    ...base,
    limit: BACKTEST_CREATE_RATE_LIMIT,
    skip: (req) => req.method !== "POST" || req.path === "/preview",
});
