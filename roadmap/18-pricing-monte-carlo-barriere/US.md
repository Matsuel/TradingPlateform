# 18 · Pricing Monte Carlo et option à barrière — User stories

> Sources : README racine : Monte Carlo (SHOULD, projection) et Structuration (roadmap mois 10).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/` | Projection (14) : PRNG seedé, bootstrap, percentiles. | Trajectoires GBM, prix, barrière. |
| `packages/contracts/src/pricing.ts` | Créé en 15 ; union `BOND` / `OPTION`. | Champ `method`. |
| `apps/web/src/features/pricing/` | Calculateur (15, 16). | Méthode et erreur standard. |

## Hors périmètre

- Autres exotiques : asiatique, lookback (COULD).
- Volatilité locale ou stochastique.
- Réduction de variance (variables antithétiques) : optimisation non nécessaire ici.
- Autocallable (19).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Dynamique | GBM sous mesure neutre au risque (dérive r − q) | Standard pour le pricing ; le bootstrap de 14 sert à la projection, pas au pricing. |
| D2 | Barrière | Surveillance quotidienne | Les barrières réelles sont souvent observées à la clôture ; une surveillance continue sous-estime le risque de dépassement. |
| D3 | Validation | Écart inférieur à 3 erreurs standard vers Black-Scholes | Critère statistique, pas un seuil arbitraire en euros. |
| D4 | Trajectoires | 100 000 par défaut, réglable de 10 000 à 1 000 000 ; seed fixe stockée | Validée le 2026-11-14. |

---

## User stories

### Lot 1 — Moteur

#### US-01 · Pricer une option sans formule fermée — MUST

**En tant que** utilisateur, **je veux** pricer une option par simulation **afin de** comprendre ce que fait une méthode numérique et où elle est fiable..

Critères d’acceptation :
- [ ] Le prix Monte Carlo est affiché avec son erreur standard.
- [ ] Il est comparé au prix de Black-Scholes pour une option européenne.

Tâches : T-01, T-02, T-04, T-05, T-06, T-07 (détail dans `TASKS.md`).

---

#### US-02 · Pricer une option à barrière — MUST

**En tant que** utilisateur, **je veux** pricer une option qui disparaît (ou apparaît) si le cours touche un seuil **afin de** comprendre pourquoi un produit structuré a souvent une barrière..

Critères d’acceptation :
- [ ] Knock-out et knock-in sont pricés ; la somme knock-out + knock-in égale l'option vanille (test).

Tâches : T-03, T-05, T-06 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat

### Lot 3 — Service

### Lot 4 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Pricer une option sans formule fermée | MUST | 1 | backtest-engine, contracts, core-backend, web |
| US-02 | Pricer une option à barrière | MUST | 1 | backtest-engine, contracts, core-backend |
