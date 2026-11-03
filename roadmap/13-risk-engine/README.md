# 13 · Risk Engine

- **Statut** : Planifiée
- **Roadmap** : Mois 6 — Mois 6 — Risk Engine (corrélations, VaR / CVaR, contribution au risque, contraintes)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/risk-engine` — PR à ouvrir
- **Points** : 25 (MUST 18, SHOULD 7) — prévus
- **Maquettes** : `33 · Risque` (créée, node `454:12126`)
- **Dépend de** : 11 (rendements corrects). Gèle le moteur de simulation à la fin de cette feature.

## Objectif

L'utilisateur voit où vient le risque de son portefeuille : corrélations, perte d'un mauvais jour, part de chaque actif, et si une contrainte est respectée. Cette feature a l'objectif pédagogique 1 du README (volatilité, corrélation).

## Comment

Fonctions pures dans `backtest-engine/engine/risk.ts`, résultat validé par un schéma de `contracts`, contraintes évaluées par `core-backend`, affichage web. Le moteur de simulation est gelé à la fin (roadmap mois 6).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **VaR** : Historique, 95 %, un jour | Méthode la plus simple à expliquer et à tester ; une VaR paramétrique suppose une loi normale, à discuter en cours. | `US.md` (à valider) |
| D2 | **Expositions** : Par actif seulement | Secteur et zone exigent les données `assetProfile` de Yahoo, non appelées aujourd'hui : reportées. | `US.md` (à valider) |
| D3 | **Contraintes** : Drawdown maximal seulement en MVP | Évite un moteur de règles ; les autres contraintes sont hors périmètre. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
