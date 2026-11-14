# 15 · Taux et obligations — User stories

> Sources : README racine : Taux et obligations (roadmap mois 8, section Structuration) ; `roadmap/README.md` (données Yahoo, taux US).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `packages/contracts/` | Schémas de backtest et de marché ; pas de courbe ni de topic de pricing. | `pricing.ts`, topics `pricing.*`. |
| `apps/market-service/routes/market/` | Routes search, details, defaults. | Route de courbe. |
| `apps/backtest-engine/engine/` | `backtest.engine.ts`, `backtest.utils.ts`, projection (14). | `bonds.ts`. |
| `apps/core-backend/routes/` | backtest, portfolio, market (proxy). | Routes pricing. |

## Hors périmètre

- Courbe euro (ESTR, Euribor) : à saisir en D4 ou via une source future.
- Taux continus, conventions de jours de marché.
- Risque de crédit de l'émetteur.
- Options (16).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Source des taux | Yahoo, 4 points US, sans clé ; FRED reporté | Pas de nouvelle dépendance ni de clé d'API en MVP. Limite : pas de courbe euro, pas de 2 ans. |
| D2 | Interpolation | Linéaire entre deux points | Simple à expliquer ; une interpolation plus fine n'apporte rien à 4 points. |
| D3 | Actualisation | Composée annuelle, base 365 | Convention la plus lisible pour un débutant ; les conventions de marché (taux continus, base 360) sont une limite affichée. |
| D4 | Taux euro | Saisi par l'utilisateur (taux plat) | Pas de source gratuite fiable ; évite une courbe inventée. |
| D6 | Source des taux | D1 confirmée (Yahoo, gratuit, sans clé) | Validée le 2026-11-14. |
| D7 | Duration | Macaulay (années) et modifiée (sensibilité à +1 % de taux) | Validée le 2026-11-14. |
| D8 | Obligation saisie | Nominal, coupon annuel, maturité, taux ; zéro-coupon = coupon à 0 | Pas de fréquence de coupon. Validée le 2026-11-14. |
| D5 | Calcul de pricing | Worker `backtest-engine` via Kafka | Règle d'architecture : tout calcul vit dans l'engine. Le même pipeline servira aux options (16) et au Monte Carlo (18). |

---

## User stories

### Lot 1 — Contrat

#### US-01 · Voir la courbe des taux — MUST

**En tant que** utilisateur, **je veux** voir les taux à différentes maturités **afin de** comprendre qu'un taux dépend de la durée du prêt..

Critères d’acceptation :
- [ ] La courbe affiche au moins 4 points US, avec leur date.
- [ ] La mention « taux US seulement, pas de courbe euro » apparaît.

Tâches : T-01, T-02, T-04, T-07 (détail dans `TASKS.md`).

---

#### US-02 · Calculer le prix d'une obligation — MUST

**En tant que** utilisateur, **je veux** calculer le prix d'une obligation à partir de la courbe **afin de** voir qu'un flux futur vaut moins aujourd'hui..

Critères d’acceptation :
- [ ] Je saisis un flux et une maturité ; le prix actualisé et la duration sont affichés.
- [ ] Un test de référence (zéro-coupon à 3 % sur 5 ans = 86,26) passe.

Tâches : T-01, T-03, T-05, T-06, T-07, T-08 (détail dans `TASKS.md`).

---

### Lot 2 — Données

### Lot 3 — Moteur

### Lot 4 — Service

### Lot 5 — Worker

### Lot 6 — Écrans

#### US-03 · Savoir quel taux est utilisé — SHOULD

**En tant que** utilisateur, **je veux** voir la méthode d'actualisation et la source du taux **afin de** lire le résultat sans ambiguïté..

Critères d’acceptation :
- [ ] La source, la date et la méthode (composé annuel, interpolation linéaire) sont affichées.

Tâches : T-07 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Voir la courbe des taux | MUST | 1 | contracts, market-service, backtest-engine, web |
| US-02 | Calculer le prix d'une obligation | MUST | 1 | contracts, backtest-engine, core-backend, web, docs |
| US-03 | Savoir quel taux est utilisé | SHOULD | 6 | web |
