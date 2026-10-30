# @trading-plateform/utils

Utilitaires transverses (`Logger` avec `Logger.here()`). N'ajoute que du code réellement partagé par plusieurs apps, sans dépendance métier. Réexporter via `src/index.ts`. Respecte `../../AGENTS.md`.

## Ajouter un utilitaire

1. Un fichier par sujet dans `src/<nom>.ts`, réexporté par `src/index.ts`.
2. Réellement partagé par ≥ 2 apps, sans dépendance métier ni vers `apps/*`.
3. Sinon, garde-le dans l'app concernée.
