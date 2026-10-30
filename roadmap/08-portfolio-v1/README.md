# 08 · Portfolio Management V1

- **Statut** : Planifiée
- **Roadmap** : Mois 4 — poids par actif, rebalancement, benchmark, CAGR, volatilité, durée de récupération et Sharpe
- **Période** : à partir du 2026-10-30 (environ 4 semaines prévues)
- **Branche / PR** : à créer
- **Points** : 98 (MUST 80, SHOULD 18) — prévus
- **Maquettes** : `12.1 · Nouveau backtest · Allocation`, `13 · Résultats d’un backtest`, `19 · Comparaison de portefeuilles` (blocs du haut), `11 · Liste des backtests`

## Objectif

Passer du backtest équipondéré « achats seuls » à un vrai portefeuille : l’utilisateur fixe un poids par actif, choisit un rebalancement et un benchmark, et lit le rendement annualisé, la volatilité, le max drawdown avec sa durée de récupération et le Sharpe face au benchmark. C’est le dernier jalon du MVP (« Définition de terminé » du README).

## Comment

Ordre imposé par les dépendances : l’engine d’abord (pur et testé), puis contrat → base → API, puis l’affichage. Cinq lots : allocation, rebalancement, métriques, benchmark, comparaison et finitions. Le détail est dans [`US.md`](US.md) (point de départ, décisions D1 à D10, US) et [`TASKS.md`](TASKS.md) (31 tâches, chemin critique, graphe).

## Décisions

À valider avant le lot 1 : voir `US.md`, section « Décisions à valider avant de coder ». Les plus structurantes : D1 (table `BacktestAllocation` et suppression irréversible de `Backtest.symbols`), D5 (taux sans risque à 0), D8 (frais sur chaque ordre, achat ou vente), D9 (benchmark rejoué avec les mêmes flux).

D1 réintroduit sous un autre nom la table `BacktestAsset` (`symbol`, `weight`) du tout premier schéma (`30a42a7`), retirée lors du passage au mono-actif (`9a14a01`) : voir [05 · Strategy Lab MVP](../05-strategy-lab-mvp/README.md), « Écarts au plan ».

## Écarts au plan

Aucun pour l’instant.

## Bilan

À remplir à la clôture (skill `feature-roadmap`, mode clôture).

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
