# 14 · Projection Monte Carlo — User stories

> Sources : README racine : Projection SHOULD « Monte Carlo seedé » ; section « Projection Monte Carlo » ; roadmap mois 7.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/backtest.utils.ts` | Rendements TWR et volatilité déjà calculés. | Génération de trajectoires. |
| `apps/backtest-engine/consumers/` | Consumer `backtest.requested`. | Consumer `projection.requested`. |
| `packages/contracts/src/` | `backtest.ts`, `event.ts`, `market.ts`. | `projection.ts` avec topics et schémas. |
| `apps/web/src/app/(base)/projection` | Dossier vide (pas de page). | Page et fan chart. |

## Hors périmètre

- Flux (versements, retraits) : taux de retrait et objectif financier (COULD).
- Scénarios de crise personnalisés (COULD).
- Modèles statistiques plus riches (COULD du README).
- Trajectoires individuelles affichées.

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Générateur | PRNG seedé implémenté dans l'engine (sans dépendance) | Une seed explicite rend le résultat testable ; une dépendance pour un générateur n'apporte rien ici. |
| D2 | Blocs | 21 jours ouvrés, fixe | Conserve un peu d'enchaînement des jours sans paramètre à exposer. |
| D3 | Stockage | Percentiles seulement | 10 000 trajectoires × 1 260 jours ne se stockent pas ; on garde ce qui s'affiche. |
| D4 | Transport | Deux nouveaux topics Kafka | Le calcul est lourd, asynchrone : même patron que le backtest, rejeu géré par statut. |

---

## User stories

### Lot 1 — Moteur

#### US-01 · Voir des futurs plausibles pour mon allocation — MUST

**En tant que** utilisateur, **je veux** voir un éventail de trajectoires futures construit sur l'historique de mon allocation **afin de** comprendre l'incertitude au lieu d'un seul chiffre..

Critères d’acceptation :
- [ ] Un fan chart montre la médiane et les bandes P10-P90 sur l'horizon.
- [ ] La projection est refaite à l'identique avec la même seed.

Tâches : T-01, T-02, T-04, T-05, T-07, T-08 (détail dans `TASKS.md`).

---

#### US-02 · Connaître la probabilité de perte — MUST

**En tant que** utilisateur, **je veux** voir la probabilité que mon capital finisse sous son montant investi **afin de** mesurer le risque de perte sur l'horizon choisi..

Critères d’acceptation :
- [ ] La probabilité est affichée avec la mention « calculée sur des scénarios historiques, pas une promesse ».

Tâches : T-02, T-07 (détail dans `TASKS.md`).

---

#### US-03 · Rejouer une projection sans doublon — MUST

**En tant que** développeur, **je veux** qu'un message Kafka rejoué ne crée pas deux résultats **afin de** respecter la règle at-least-once du projet..

Critères d’acceptation :
- [ ] Le rejeu ne crée ni double projection ni double résultat (test).

Tâches : T-01, T-03, T-06 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat

### Lot 3 — Service

### Lot 4 — Worker

### Lot 5 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Voir des futurs plausibles pour mon allocation | MUST | 1 | backtest-engine, core-backend, web, docs |
| US-02 | Connaître la probabilité de perte | MUST | 1 | backtest-engine, web |
| US-03 | Rejouer une projection sans doublon | MUST | 1 | backtest-engine, contracts, core-backend |
