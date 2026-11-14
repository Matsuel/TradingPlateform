# 15 · Taux et obligations

- **Statut** : Planifiée
- **Roadmap** : Mois 8 — Mois 8 — Taux et obligations (courbe, actualisation, prix, duration, zéro-coupon)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/taux-et-obligations` — PR à ouvrir
- **Points** : 27 (MUST 21, SHOULD 6) — prévus
- **Maquettes** : `35 · Taux et obligations` (créée, node `456:12522`)
- **Écrans modifiés** : aucun (page `Taux` de la sidebar existante)
- **Dépend de** : 08 (livrée). Introduit le pipeline `pricing.*` réutilisé par 16 à 20.

## Objectif

L'utilisateur comprend qu'un euro futur vaut moins qu'un euro aujourd'hui, et calcule le prix d'une obligation. C'est la brique « coffre-fort » de tout produit structuré. Cette feature pose aussi le pipeline de pricing (worker + Kafka) qui sert à toutes les suivantes.

## Comment

Taux US lus dans `market-service` (4 points, pas de clé). Interpolation et actualisation dans `backtest-engine/engine/bonds.ts` (fonctions pures). Calcul demandé par `core-backend` via `pricing.requested`, résultat par `pricing.completed` (D5). Web affiche.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Source des taux** : Yahoo, 4 points US, sans clé ; FRED reporté | Pas de nouvelle dépendance ni de clé d'API en MVP. Limite : pas de courbe euro, pas de 2 ans. | `US.md` (à valider) |
| D2 | **Interpolation** : Linéaire entre deux points | Simple à expliquer ; une interpolation plus fine n'apporte rien à 4 points. | `US.md` (à valider) |
| D3 | **Actualisation** : Composée annuelle, base 365 | Convention la plus lisible pour un débutant ; les conventions de marché (taux continus, base 360) sont une limite affichée. | `US.md` (à valider) |
| D4 | **Taux euro** : Saisi par l'utilisateur (taux plat) | Pas de source gratuite fiable ; évite une courbe inventée. | `US.md` (à valider) |
| D5 | **Calcul de pricing** : Worker `backtest-engine` via Kafka | Règle d'architecture : tout calcul vit dans l'engine. Le même pipeline servira aux options (16) et au Monte Carlo (18). | Confirmée le 2026-11-14 : pipeline posé dès la 15 |
| D6 | **Source des taux** : D1 confirmée (Yahoo, gratuit, sans clé) | Seule contrainte : gratuit. L'index parlait de FRED : corrigé. | Décision du 2026-11-14 |
| D7 | **Duration** : Macaulay (années) et modifiée (sensibilité du prix à +1 % de taux) | Le couple pédagogique complet. | Décision du 2026-11-14 |
| D8 | **Obligation saisie** : nominal, coupon annuel, maturité, taux ; zéro-coupon = coupon à 0 | Pas de fréquence de coupon en MVP : moins de cas, limite affichée. | Décision du 2026-11-14 |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
