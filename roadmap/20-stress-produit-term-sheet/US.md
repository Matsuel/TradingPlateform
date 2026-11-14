# 20 · Stress de produit et term sheet — User stories

> Sources : README racine : Structuration (term sheet, stress de scénarios), Risque SHOULD ; roadmap mois 10.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/` | `structured.ts`, `structured-mc.ts` (19). | `stress.ts`. |
| `packages/contracts/src/structured.ts` | Créé en 19. | Schémas de stress et de fiche. |
| `apps/web/src/features/structured/` | Créé en 19. | Page fiche et tableau de stress. |

## Hors périmètre

- Scénarios personnalisés (COULD).
- Export PDF.
- Stress de portefeuille (13).
- Historique de crises réelles comme scénarios.

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Scénarios | Quatre chocs fixes, non paramétrables | Évite une configuration pour une valeur fixe ; une option « scénario personnalisé » reste COULD. |
| D2 | Format de la fiche | Page web, pas de PDF | Pas de dépendance d'export en MVP ; un PDF viendra si besoin. |
| D3 | Scénarios de performance | Favorable, neutre, défavorable calculés par le repricing | Les trois valeurs viennent du même moteur que le stress. |
| D4 | Quatre chocs | Sous-jacent −20 %, volatilité +10 points, taux −1 point, taux +1 point | Validée le 2026-11-14. |
| D5 | Scénarios de la fiche | Cours final +20 %, inchangé, −30 % à l'échéance ; payoff en % du nominal | Validée le 2026-11-14. |

---

## User stories

### Lot 1 — Moteur

#### US-01 · Voir ce qui arrive au produit si le marché bouge — MUST

**En tant que** utilisateur, **je veux** voir la valeur du produit dans quatre scénarios de choc **afin de** repérer l'exposition cachée..

Critères d’acceptation :
- [ ] Quatre scénarios sont affichés avec le prix et la variation.
- [ ] Les scénarios sont fixes et leur définition est affichée.

Tâches : T-01, T-02, T-05, T-06 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat

#### US-02 · Lire une fiche produit — MUST

**En tant que** utilisateur, **je veux** lire une term sheet avec les paramètres et trois scénarios **afin de** savoir ce qu'un produit promet et ce qu'il fait si le marché va mal..

Critères d’acceptation :
- [ ] La fiche contient paramètres, scénarios favorable / neutre / défavorable et risques.
- [ ] La mention « scénarios historiques ou fixés, pas une promesse » figure dans la fiche.

Tâches : T-02, T-03, T-04 (détail dans `TASKS.md`).

---

### Lot 3 — Service

### Lot 4 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Voir ce qui arrive au produit si le marché bouge | MUST | 1 | backtest-engine, contracts, web, docs |
| US-02 | Lire une fiche produit | MUST | 2 | contracts, core-backend, web |
