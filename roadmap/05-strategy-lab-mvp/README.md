# 05 · Strategy Lab MVP

- **Statut** : Livrée
- **Roadmap** : Mois 2 — backtest asynchrone DCA / investissement unique, frais, courbe de valeur, transactions simulées, historique des exécutions, tests du moteur
- **Période** : 2026-10-24 → 2026-10-28
- **Branche / PR** : `feat/backtest` — #3 (merge `e67e950`) ; les premiers commits (modèles, API) sont passés par la PR #2
- **Points** : 50 (MUST 45, SHOULD 5) — estimés a posteriori
- **Maquettes** : `11 · Liste des backtests`, `12 · Nouveau backtest`, `13 · Résultats d’un backtest`, `06.1 · Test rapide (sheet · Test)`

## Objectif

Premier parcours métier de bout en bout : l’utilisateur configure un backtest (symboles, période, DCA ou investissement unique, frais), le lance, suit son statut, puis lit la courbe de valeur, les transactions simulées et les métriques. Le calcul tourne dans un worker asynchrone piloté par Kafka.

## Comment

- **Modèle** : `Backtest` (paramètres réutilisables) et `BacktestExecution` (une ligne par lancement, `attempt` unique par backtest) séparés de `BacktestResult` (une ligne par exécution terminée) (`30a42a7`, `9a14a01`, `2331505`). `Backtest.latestExecution` est dénormalisé pour filtrer et compter par statut avec Prisma (`540900e`).
- **Flux** : `POST /api/backtests` crée le backtest et une exécution `PENDING`, puis publie `backtest.requested`. `backtest-engine` consomme, publie `backtest.started`, récupère les clôtures Yahoo, calcule, puis publie `backtest.completed` ou `backtest.failed`. `core-backend` consomme ces événements et applique des transitions gardées (`updateMany` filtré sur les statuts de départ ; 0 ligne = rejoué, ignoré) (`aa9ca3d`).
- **Packages partagés** : `packages/utils` (Logger), `packages/kafka` (`KafkaClient`, `KafkaProducer`, `KafkaConsumer`, `createKafkaEvent`), `packages/contracts` (schémas zod des événements et topics) ; workspaces Bun (`f584a4e`, `b9cfc63`, `ae83d37`, `aa9ca3d`).
- **Moteur** : fonction pure `runBacktest(params, prices)` dans `backtest-engine/engine/` : portefeuille équipondéré, versement initial puis récurrent au premier jour de cotation de chaque période, achat à la clôture, frais sur chaque achat, cours manquant reporté ; testée avec `bun test` (`aa9ca3d`).
- **Invariant** : une seule exécution active par backtest ; relancer pendant une exécution `PENDING`/`RUNNING` lève `ConflictError` (409) (`2331505`).
- **Web** : champs de formulaire partagés (`components/form`), formulaire « Nouveau backtest » par sections avec `SymbolsField`, liste avec cartes de stats, filtres par statut et pagination, détail avec courbe, transactions et historique d’exécutions, test rapide depuis la fiche symbole (`109e9a9` → `bbaf67d`).
- **Conventions** : `AGENTS.md` par dossier, `core-backend` désigné architecture de référence (`a0e982d`, `21d16b3`).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | Calcul dans un worker Kafka dédié plutôt que dans l’API. | Calcul long, asynchrone, isolé ; objectif pédagogique « traitement orienté événements ». | `abcbb28`, `aa9ca3d` |
| D2 | `core-backend` seul écrivain en base ; l’engine publie, le backend applique. | Une seule source de vérité, pas de base partagée. | `aa9ca3d` |
| D3 | Transitions gardées par statut (idempotence at-least-once). | Kafka peut rejouer un message. | `aa9ca3d` |
| D4 | Exécution distincte de la configuration ; chaque relance conserve son résultat. | Historique et comparaison des lancements. | `9a14a01` |
| D5 | Contrats zod partagés dans `packages/contracts`. | Producteur et consommateur valident la même forme. | `aa9ca3d` |
| D6 | `latestExecution` dénormalisé. | Filtrer et compter par statut courant avec Prisma, sans SQL écrit à la main. | `540900e` |

## Écarts au plan

- Le plan d’époque (`docs/superpowers/plans/2026-10-25-backtest-mvp.md`, `9a14a01`) prévoyait un backtest **mono-actif**, calculé **dans `core-backend`**, exécuté à **l’ouverture** du jour, sans Kafka. Le livré : multi-symboles équipondérés, worker Kafka, exécution à la clôture.
- Le premier schéma contenait une table `BacktestAsset` avec un poids par actif (`30a42a7`) ; elle a été retirée au profit du mono-actif (`9a14a01`), puis remplacée par `Backtest.symbols String[]` (`be2329a`). La feature 08 réintroduit une table d’allocation.
- `apps/matching-engine` (bourse simulée) a été renommé en `apps/backtest-engine` (`abcbb28`).

## Bilan

MVP livré : statut `PENDING` → `RUNNING` → `COMPLETED`/`FAILED` visible, résultat persistant, relance sans écrasement. Limites reprises par la feature 07 : frais totaux, quantités et positions finales, comparaison DCA / investissement unique, hypothèses affichées, tests de reproductibilité.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
