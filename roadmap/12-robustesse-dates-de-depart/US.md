# 12 · Robustesse : dates de départ et métriques glissantes — User stories

> Sources : README racine : Strategy Lab / Portefeuille SHOULD « comparaison de dates de départ, métriques glissantes » ; roadmap annuelle mois 5.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/` | `backtest.engine.ts`, `backtest.utils.ts` (TWR, CAGR, volatilité, drawdown). | Fenêtres glissantes et résumé. |
| `packages/contracts/src/backtest.ts` | `backtestRequestedPayloadSchema` (un départ), comparaison de deux backtests (`COMPARED_METRICS`). | Lot de départs, résumé glissant. |
| `apps/core-backend/services/backtest.service.ts` | Création d'un backtest, comparaison. | Création de lot, agrégation. |
| `apps/web/src/features/backtest/` | Formulaire, liste, détail, comparaison. | Formulaire de lot, page de lot. |

## Hors périmètre

- Dates de départ à la journée près sur des données intraday.
- Effet de la date de fin (feature future si besoin).
- Optimisation sur les dates (surapprentissage, voir feature 08 « Décisions »).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Lot de départs | N backtests liés par `batchId`, pas un calcul moteur unique | Réutilise le pipeline existant (un `backtest.requested` par départ) : pas de nouveau topic, rejeu déjà géré. |
| D2 | Pas des fenêtres | Un jour ouvré | Un pas plus grand masquerait les pires entrées. Coût de calcul acceptable sur 10 ans. |
| D3 | Périodes | 1, 3 et 5 ans seulement | Trois durées suffisent pour l'objectif pédagogique ; pas de paramètre libre. |

---

## User stories

### Lot 1 — Moteur

#### US-02 · Voir le pire cas sur une période glissante — MUST

**En tant que** utilisateur, **je veux** voir le rendement sur toutes les fenêtres de 1, 3 ou 5 ans **afin de** répondre à « combien aurais-je perdu en entrant au mauvais moment ? »..

Critères d’acceptation :
- [x] Les fenêtres d'1, 3 et 5 ans sont calculées sur tout l'historique du backtest.
- [x] Le résumé affiche pire, médiane, meilleure et part négative.

Tâches : T-01, T-02, T-04, T-07 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat

#### US-01 · Comparer une stratégie selon la date d'entrée — MUST

**En tant que** utilisateur, **je veux** lancer la même stratégie sur plusieurs dates de départ et voir les résultats côte à côte **afin de** savoir si mon résultat dépend de la chance de mon point d'entrée..

Critères d’acceptation :
- [x] Je peux saisir de 2 à 10 dates de départ pour une même stratégie.
- [x] Un tableau affiche CAGR, volatilité et drawdown par départ.
- [x] Un départ invalide est refusé avant calcul.

Tâches : T-02, T-03, T-05, T-06, T-07, T-08 (détail dans `TASKS.md`).

---

### Lot 3 — Service

### Lot 4 — Données

### Lot 5 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Comparer une stratégie selon la date d'entrée | MUST | 2 | contracts, core-backend, web, docs |
| US-02 | Voir le pire cas sur une période glissante | MUST | 1 | backtest-engine, contracts, core-backend, web |
