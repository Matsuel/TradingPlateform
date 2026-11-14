# 19 · Produits structurés : décomposition, juste valeur, marge — User stories

> Sources : README racine : Structuration, produits structurés (roadmap mois 10) ; `roadmap/README.md` (limites des données).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `packages/contracts/` | `pricing.ts` (15 à 18). | `structured.ts`. |
| `apps/backtest-engine/engine/` | `bonds.ts`, `options.ts`, `pricing-mc.ts`. | `structured.ts`, `structured-mc.ts`. |
| `apps/web/src/features/` | Aucun dossier produit structuré. | `structured/`. |

## Hors périmètre

- Worst-of (COULD).
- Coûts de couverture et de financement de l'émetteur (hypothèses non modélisées).
- Émission réelle, prospectus, conformité (hors périmètre global).
- Stress et term sheet (20).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Types livrés | Capital garanti, reverse convertible, autocallable | Les trois couvrent zéro-coupon, vente de put et barrière. Worst-of reporté (COULD). |
| D2 | Participation | Calculée par le moteur : budget d'option divisé par le prix du call | Formule simple et lisible : elle montre le compromis garantie / participation. |
| D3 | Autocallable | Monte Carlo avec dates d'observation | Un autocallable n'a pas de formule fermée. |
| D4 | Marge | Prix client − juste valeur, en devise et en % | Affiche la rémunération sans la faire passer pour un conseil. Hypothèses de financement et de couverture non incluses. |
| D5 | Prix client | Nominal à 100 %, marge = 100 % − juste valeur | Validée le 2026-11-14. |
| D6 | Autocallable | Observation annuelle, rappel ≥ 100 % (coupon cumulé), barrière 60 %, 5 ans ; niveaux modifiables | Validée le 2026-11-14. |

---

## User stories

### Lot 1 — Moteur

#### US-01 · Décomposer un capital garanti — MUST

**En tant que** utilisateur, **je veux** voir comment un capital garanti est fabriqué à partir d'un zéro-coupon et d'un call **afin de** comprendre d'où vient la participation à la hausse..

Critères d’acceptation :
- [ ] La décomposition, la participation et le budget d'option sont affichés.
- [ ] Le total des briques égale le prix du produit.

Tâches : T-01, T-04, T-05, T-06, T-07 (détail dans `TASKS.md`).

---

#### US-02 · Voir la marge du structureur — MUST

**En tant que** utilisateur, **je veux** comparer le prix client à la juste valeur **afin de** comprendre la rémunération de celui qui vend le produit..

Critères d’acceptation :
- [ ] Juste valeur, prix client et marge sont affichés.
- [ ] La marge est calculée par le backend.

Tâches : T-01, T-03, T-04, T-05, T-06 (détail dans `TASKS.md`).

---

#### US-03 · Pricer un autocallable — MUST

**En tant que** utilisateur, **je veux** pricer un produit à remboursement anticipé **afin de** voir comment les dates d'observation et la barrière changent le prix..

Critères d’acceptation :
- [ ] Le prix autocallable est affiché avec son erreur standard.
- [ ] Les dates d'observation et la barrière sont saisies et affichées.

Tâches : T-02, T-03, T-04, T-05 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat

### Lot 3 — Service

### Lot 4 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Décomposer un capital garanti | MUST | 1 | backtest-engine, contracts, core-backend, web |
| US-02 | Voir la marge du structureur | MUST | 1 | backtest-engine, contracts, core-backend, web |
| US-03 | Pricer un autocallable | MUST | 1 | backtest-engine, contracts, core-backend |
