# 14 · Projection Monte Carlo

- **Statut** : Planifiée
- **Roadmap** : Mois 7 — Mois 7 — Projection (Monte Carlo seedé, fan chart, percentiles, probabilité de perte)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/projection-monte-carlo` — PR à ouvrir
- **Points** : 26 (MUST 25, SHOULD 1) — prévus
- **Maquettes** : `34 · Projection Monte Carlo` (créée, node `455:12320`)
- **Écrans modifiés** : `13 · Résultat d’un backtest` (node `350:7214`) : point d’entrée vers la projection d’une allocation (non précisé dans les US, la maquette 34 est une page à part) — à trancher puis dessiner
- **Dépend de** : 12 (robustesse). Le moteur est réutilisé en 18 pour le pricing.

## Objectif

L'utilisateur voit la distribution des futurs possibles de son allocation, bâtie sur son propre passé. Le moteur est le même que celui qui pricera les options exotiques (18) : c'est le socle du pricing.

## Comment

Worker `backtest-engine` : rendements journaliers historiques, bootstrap par blocs, PRNG seedé. Demande et résultat via deux topics Kafka (D4), même patron que le backtest. Le web affiche les percentiles.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Générateur** : PRNG seedé implémenté dans l'engine (sans dépendance) | Une seed explicite rend le résultat testable ; une dépendance pour un générateur n'apporte rien ici. | `US.md` (à valider) |
| D2 | **Blocs** : 21 jours ouvrés, fixe | Conserve un peu d'enchaînement des jours sans paramètre à exposer. | `US.md` (à valider) |
| D3 | **Stockage** : Percentiles seulement | 10 000 trajectoires × 1 260 jours ne se stockent pas ; on garde ce qui s'affiche. | `US.md` (à valider) |
| D4 | **Transport** : Deux nouveaux topics Kafka | Le calcul est lourd, asynchrone : même patron que le backtest, rejeu géré par statut. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
