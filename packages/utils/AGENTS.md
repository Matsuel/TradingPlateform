# @azimut/utils

Utilitaires transverses : `Logger` (`Logger.here()`), `onShutdown`, et le calendrier partagé par la simulation et son aperçu (`periodKey`, `businessDays`, `estimateSchedule`, dont les règles appartiennent à l'engine : un changement de règle de versement ou de rebalancement se répercute ici et dans `backtest-engine/test/backtest.schedule.test.ts`). N'ajoute que du code réellement partagé par plusieurs apps, sans dépendance métier. Réexporter via `src/index.ts`. Respecte `../../AGENTS.md`.

## Ajouter un utilitaire

1. Un fichier par sujet dans `src/<nom>.ts`, réexporté par `src/index.ts`.
2. Réellement partagé par ≥ 2 apps, sans dépendance métier ni vers `apps/*`.
3. Sinon, garde-le dans l'app concernée.
