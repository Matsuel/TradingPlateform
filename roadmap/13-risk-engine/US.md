# 13 · Risk Engine — User stories

> Sources : README racine : Risque MUST (drawdown, durée de récupération), SHOULD (corrélations, VaR/CVaR, contribution, contraintes) ; roadmap mois 6.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/backtest.utils.ts` | `createDrawdownTracker`, `annualizedVolatility`, `sharpeRatio`. | Corrélation, VaR, CVaR, contributions. |
| `packages/contracts/src/backtest.ts` | `maxDrawdown`, `volatility` dans `backtestCompletedPayloadSchema`. | Schémas de risque (fichier dédié). |
| `apps/core-backend/services/` | `backtest.service.ts`, `portfolio.service.ts`. | `risk.service.ts`. |
| `apps/web/src/app/(base)/risk` | Dossier vide (pas de page). | Page ou bloc de risque. |

## Hors périmètre

- Facteurs (analyse factorielle, COULD du README).
- VaR paramétrique et VaR de Monte Carlo.
- Expositions par secteur et zone (D2).
- Notifications de dépassement (feature COULD).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | VaR | Historique, 95 %, un jour | Méthode la plus simple à expliquer et à tester ; une VaR paramétrique suppose une loi normale, à discuter en cours. |
| D2 | Expositions | Par actif seulement | Secteur et zone exigent les données `assetProfile` de Yahoo, non appelées aujourd'hui : reportées. |
| D3 | Contraintes | Drawdown maximal seulement en MVP | Évite un moteur de règles ; les autres contraintes sont hors périmètre. |

---

## User stories

### Lot 1 — Moteur

#### US-01 · Voir comment mes actifs bougent ensemble — MUST

**En tant que** utilisateur, **je veux** voir la corrélation entre mes actifs et leur part réelle du risque **afin de** comprendre que diversifier, c'est surtout avoir des actifs qui ne bougent pas ensemble..

Critères d’acceptation :
- [ ] Une matrice de corrélation des actifs du portefeuille est affichée.
- [ ] Les contributions au risque somment à 100 %.
- [ ] La concentration est affichée.

Tâches : T-01, T-03, T-06 (détail dans `TASKS.md`).

---

#### US-02 · Connaître la perte qu'un mauvais jour peut coûter — MUST

**En tant que** utilisateur, **je veux** voir la VaR et la CVaR à 95 % **afin de** mesurer le risque au-delà du drawdown..

Critères d’acceptation :
- [ ] VaR et CVaR à 95 % sont affichées, avec la mention « historique, un jour ».

Tâches : T-02, T-06 (détail dans `TASKS.md`).

---

#### US-03 · Vérifier une contrainte de risque — SHOULD

**En tant que** utilisateur, **je veux** fixer un drawdown maximal et voir s'il est respecté **afin de** savoir si la stratégie historique respecte ma limite..

Critères d’acceptation :
- [ ] Je saisis un drawdown max ; le résultat indique respectée ou non respectée.
- [ ] La mention « passé ne garantit pas l'avenir » accompagne le résultat.

Tâches : T-03, T-04, T-05, T-07 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat

### Lot 3 — Service

### Lot 4 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Voir comment mes actifs bougent ensemble | MUST | 1 | backtest-engine, web |
| US-02 | Connaître la perte qu'un mauvais jour peut coûter | MUST | 1 | backtest-engine, web |
| US-03 | Vérifier une contrainte de risque | SHOULD | 1 | backtest-engine, contracts, core-backend, web |
