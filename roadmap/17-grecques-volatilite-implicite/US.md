# 17 · Grecques, volatilité implicite et smile — User stories

> Sources : `roadmap/README.md` (données SPY du 2026-11-03) ; README racine : Options (mois 9).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/options.ts` | Créé en 16 : Black-Scholes, payoffs, parité. | Inversion, grecques, filtre. |
| `apps/market-service/` | Route de chaîne d'options (16 T-03), valeurs Yahoo indicatives. | Rien : source de la chaîne. |
| `packages/contracts/src/pricing.ts` | Créé en 15, union `OPTION`. | Smile et grecques. |

## Hors périmètre

- Surface 3D.
- Volatilité locale ou stochastique.
- Historique de chaînes d'options (non disponible : chaîne du jour seulement).
- Dividendes discrets.

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Volatilité implicite | Calculée par le moteur (bisection) | Les données Yahoo sont incohérentes : sur SPY, 91 contrats sur 220 ont une IV nulle ou aberrante (14 juil. 2026, séance non confirmée). |
| D2 | Filtre | Prix nul, bid/ask nuls, IV hors [1 %, 300 %] écartés et comptés | Un filtre visible vaut mieux qu'un nettoyage silencieux. |
| D3 | Surface | Smile 2D par échéance, pas de surface 3D | Une courbe par échéance suffit pour voir le smile ; la 3D est coûteuse à lire et à tester. |

---

## User stories

### Lot 1 — Moteur

#### US-01 · Voir la volatilité que le marché attend — MUST

**En tant que** utilisateur, **je veux** voir la volatilité implicite d'une option à partir de son prix **afin de** comparer ce que le marché anticipe à ce qui s'est passé..

Critères d’acceptation :
- [ ] La volatilité implicite est calculée par le moteur, pas copiée de Yahoo.
- [ ] Les contrats sans prix exploitable sont écartés et leur nombre est affiché.

Tâches : T-01, T-03, T-05 (détail dans `TASKS.md`).

---

#### US-02 · Comprendre comment le prix réagit — MUST

**En tant que** utilisateur, **je veux** voir les grecques d'une option **afin de** savoir quel paramètre fait bouger le prix..

Critères d’acceptation :
- [ ] Delta, gamma, vega, theta, rho sont affichés avec leur unité et une phrase d'explication (glossaire, feature 10).

Tâches : T-02, T-04, T-07 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat

#### US-03 · Voir le smile de volatilité — SHOULD

**En tant que** utilisateur, **je veux** voir la volatilité implicite selon le strike **afin de** comprendre que Black-Scholes suppose à tort une volatilité constante..

Critères d’acceptation :
- [ ] Une courbe par échéance montre la volatilité implicite selon le strike.

Tâches : T-04, T-05, T-06 (détail dans `TASKS.md`).

---

### Lot 3 — Service

### Lot 4 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Voir la volatilité que le marché attend | MUST | 1 | backtest-engine, core-backend |
| US-02 | Comprendre comment le prix réagit | MUST | 1 | backtest-engine, contracts, web |
| US-03 | Voir le smile de volatilité | SHOULD | 2 | contracts, core-backend, web |
