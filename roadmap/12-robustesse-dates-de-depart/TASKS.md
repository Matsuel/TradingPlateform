# 12 · Robustesse : dates de départ et métriques glissantes — Tâches

> Décisions : `US.md`. Échelle de points, statuts et définition de terminé commune : [`roadmap/README.md`](../README.md). Points prévus.

## Synthèse

| Tâche | Titre | US | Couche | Priorité | Points | Dépend de | Commits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | Engine : métriques glissantes et résumé | US-02 | backtest-engine | MUST | 5 | — | — |
| T-02 | Contrat : lot de départs et résumé glissant | US-01, US-02 | contracts | MUST | 2 | — | — |
| T-03 | Création d'un lot de départs | US-01 | core-backend | MUST | 5 | T-02 | — |
| T-04 | Stockage du résultat glissant | US-02 | core-backend | MUST | 3 | T-01, T-02 | — |
| T-05 | Agrégation du lot : CAGR et drawdown par départ | US-01 | core-backend | MUST | 3 | T-03 | — |
| T-06 | Formulaire de lot de départs | US-01 | web | MUST | 3 | T-03 | — |
| T-07 | Page du lot : tableau des départs et distribution glissante | US-01, US-02 | web | SHOULD | 5 | T-04, T-05 | — |
| T-08 | Catalogue API et composants | US-01 | docs | SHOULD | 1 | T-03 | — |

**Total** : 27 points — MUST 21, SHOULD 6.

| Lot | Tâches | Points |
| --- | --- | --- |
| 1. Moteur | T-01 | 5 |
| 2. Contrat | T-02 | 2 |
| 3. Service | T-03 → T-05 | 8 |
| 4. Données | T-04 | 3 |
| 5. Écrans | T-06 → T-08 | 9 |

**Chemin critique** (15 points) : T-02 → T-03 → T-05 → T-07. T-03 : le lot crée N exécutions ; le rejeu doit rester idempotent par départ.

**Parallélisable** : T-01, T-02 dès le début ; T-01, T-02 ; T-03 après T-02 ; T-06 après T-03.

## Graphe des dépendances

```mermaid
flowchart LR
    T01[T-01 Engine  métriques glissantes et résumé]
    T02[T-02 Contrat  lot de départs et résumé glissant]
    T03[T-03 Création d'un lot de départs]
    T04[T-04 Stockage du résultat glissant]
    T05[T-05 Agrégation du lot  CAGR et drawdown par départ]
    T06[T-06 Formulaire de lot de départs]
    T07[T-07 Page du lot  tableau des départs et distribution glissante]
    T08[T-08 Catalogue API et composants]
    T02 --> T03
    T01 --> T04
    T02 --> T04
    T03 --> T05
    T03 --> T06
    T04 --> T07
    T05 --> T07
    T03 --> T08
```

---

## Lot 1 — Moteur

### T-01 · Engine : métriques glissantes et résumé

- **US** : US-02 · **Priorité** : MUST · **Points** : 5 · **Dépend de** : — · **Commits** : —
- **Fichiers** : `apps/backtest-engine/engine/rolling.ts`, `rolling.test.ts`

Critères d’acceptation :
- [ ] Fenêtres d'1, 3 et 5 ans, pas d'un jour ouvré (D2).
- [ ] Résumé : pire, médiane, meilleure fenêtre, part des fenêtres négatives.
- [ ] Fonction pure ; un jeu de test à résultat connu.

## Lot 2 — Contrat

### T-02 · Contrat : lot de départs et résumé glissant

- **US** : US-01, US-02 · **Priorité** : MUST · **Points** : 2 · **Dépend de** : — · **Commits** : —
- **Fichiers** : `packages/contracts/src/backtest.ts`

Critères d’acceptation :
- [ ] `startDates` (liste de dates, 2 à 10) ajouté à la demande, `batchId` au résultat.
- [ ] Schéma zod avec validation des bornes.

## Lot 3 — Service

### T-03 · Création d'un lot de départs

- **US** : US-01 · **Priorité** : MUST · **Points** : 5 · **Dépend de** : T-02 · **Commits** : —
- **Fichiers** : `apps/core-backend/services/backtest.service.ts`, `routes/backtest/backtest.routes.ts`

Critères d’acceptation :
- [ ] Une requête crée N backtests liés par `batchId`, un `backtest.requested` par départ.
- [ ] Rejeu idempotent : même lot, pas de doublon.
- [ ] Un départ trop proche de la fin est refusé (400).

### T-05 · Agrégation du lot : CAGR et drawdown par départ

- **US** : US-01 · **Priorité** : MUST · **Points** : 3 · **Dépend de** : T-03 · **Commits** : —
- **Fichiers** : `apps/core-backend/services/backtest.service.ts`

Critères d’acceptation :
- [ ] Liste triée par date de départ avec CAGR, volatilité et drawdown.
- [ ] Calcul côté service à partir des résultats stockés, sans recalcul moteur.

## Lot 4 — Données

### T-04 · Stockage du résultat glissant

- **US** : US-02 · **Priorité** : MUST · **Points** : 3 · **Dépend de** : T-01, T-02 · **Commits** : —
- **Fichiers** : `apps/core-backend/prisma/schema.prisma`, `prisma/migrations/`

Critères d’acceptation :
- [ ] Champ JSON nullable `rollingSummary` sur `BacktestResult`.
- [ ] Migration additive.

## Lot 5 — Écrans

### T-06 · Formulaire de lot de départs

- **US** : US-01 · **Priorité** : MUST · **Points** : 3 · **Dépend de** : T-03 · **Commits** : —
- **Fichiers** : `apps/web/src/features/backtest/new-backtest-form.tsx`

Critères d’acceptation :
- [ ] Saisie de 2 à 10 dates de départ.
- [ ] Valeurs affichées telles que reçues ; validation de forme seulement.

### T-07 · Page du lot : tableau des départs et distribution glissante

- **US** : US-01, US-02 · **Priorité** : SHOULD · **Points** : 5 · **Dépend de** : T-04, T-05 · **Commits** : —
- **Fichiers** : `apps/web/src/features/backtest/` (nouveau composant lot)

Critères d’acceptation :
- [ ] Tableau d'un départ par ligne.
- [ ] Distribution : pire, médiane, meilleure, part négative, affichées telles que reçues.

### T-08 · Catalogue API et composants

- **US** : US-01 · **Priorité** : SHOULD · **Points** : 1 · **Dépend de** : T-03 · **Commits** : —
- **Fichiers** : `apps/core-backend/API.md`, `apps/web/COMPONENTS.md`

Critères d’acceptation :
- [ ] Routes et composants du lot documentés.
