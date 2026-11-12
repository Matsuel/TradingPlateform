// Taille maximale d'un body JSON
export const JSON_BODY_LIMIT = "100kb";

// Fenêtre commune de tous les limiteurs de débit
export const RATE_LIMIT_WINDOW_MS = 60_000;

// Requêtes par fenêtre et par IP : l'authentification est la cible des attaques par force brute, la création d'un backtest lance un calcul
export const AUTH_RATE_LIMIT = 30;
export const BACKTEST_CREATE_RATE_LIMIT = 20;
