# 16 · Options vanilles : payoffs et Black-Scholes — User stories

> Sources : README racine : Options (roadmap mois 9) ; `roadmap/README.md` (données SPY : chaîne disponible, qualité à traiter en 17).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/` | `backtest.utils.ts` (volatilité, Sharpe). | Black-Scholes, payoffs, parité. |
| `apps/market-service/routes/market/` | search, details, defaults. | Route de chaîne d'options (yahoo `options`). |
| `packages/contracts/src/pricing.ts` | Créé en 15. | Union `OPTION`. |
| `apps/web/src/features/pricing/` | Créé en 15. | Calculateur. |

## Hors périmètre

- Options américaines et exercice anticipé.
- Dividendes discrets.
- Négociation d'options (ordres, marge) : hors périmètre global.
- Volatilité implicite recalculée par le moteur (17).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Modèle | Black-Scholes, européen, dividende continu q | Modèle de référence du cours. Dividendes discrets (ajustement du forward) reportés. |
| D2 | Volatilité | Saisie par l'utilisateur, pré-remplie avec la volatilité historique | La volatilité implicite est traitée en 17 ; une valeur Yahoo brute n'est pas une source de vérité. |
| D3 | Options américaines | Hors périmètre | Exercice anticipé : pas en MVP (voir README, COULD). |

---

## User stories

### Lot 1 — Moteur

#### US-01 · Pricer une option européenne — MUST

**En tant que** utilisateur, **je veux** calculer le prix d'un call ou d'un put à partir de mes paramètres **afin de** comprendre comment le prix dépend du cours, du temps, des taux et de la volatilité..

Critères d’acceptation :
- [ ] Je saisis spot, strike, maturité, taux, dividende et volatilité.
- [ ] Le prix du call et du put est affiché, et correspond au test de référence.

Tâches : T-01, T-02, T-04, T-05, T-06, T-07 (détail dans `TASKS.md`).

---

#### US-02 · Voir le payoff d'une option — MUST

**En tant que** utilisateur, **je veux** voir le gain ou la perte à l'échéance selon le cours final **afin de** comprendre ce que j'achète ou vends..

Critères d’acceptation :
- [ ] Un diagramme de payoff montre call et put sur une grille de cours.

Tâches : T-02, T-03, T-04, T-07 (détail dans `TASKS.md`).

---

#### US-03 · Vérifier la cohérence du moteur — MUST

**En tant que** développeur, **je veux** un test de parité call-put et une valeur de référence **afin de** avoir confiance dans les prix affichés..

Critères d’acceptation :
- [ ] La parité passe à 1e-6 près ; la valeur de référence passe.

Tâches : T-01 (détail dans `TASKS.md`).

---

### Lot 2 — Données

### Lot 3 — Contrat

### Lot 4 — Service

### Lot 5 — Worker

### Lot 6 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Pricer une option européenne | MUST | 1 | backtest-engine, contracts, core-backend, web |
| US-02 | Voir le payoff d'une option | MUST | 1 | backtest-engine, market-service, contracts, web |
| US-03 | Vérifier la cohérence du moteur | MUST | 1 | backtest-engine |
