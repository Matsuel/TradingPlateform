# 01 · Socle technique

- **Statut** : Livrée
- **Roadmap** : Mois 1 — cadrage et socle local (monorepo, Compose, API, base de données)
- **Période** : 2026-09-30 → 2026-10-19
- **Branche / PR** : commits directs sur `develop`
- **Points** : 18 (MUST 15, SHOULD 3) — estimés a posteriori
- **Maquettes** : aucune

## Objectif

Poser ce sur quoi tout le reste s’appuie : la vision du projet, une infrastructure locale qui démarre en une commande, une API Express qui parle à PostgreSQL via Prisma avec des erreurs uniformes, et l’application Next.js.

## Comment

- **Cadrage** : le `README.md` décrit dès le départ la vision « bourse simulée distribuée », puis reçoit la section « Portfolio Management Lab » (`a470a50`), germe du pivot de la feature 07.
- **Infrastructure** : `docker-compose.yml` lance Kafka (KRaft), le PostgreSQL de l’application et Conduktor (console Kafka, avec sa propre base) (`525a325`).
- **API** : Express 5 et CORS dans `apps/core-backend/index.ts` (`117650d`). Erreurs : classe `AppError` à statut HTTP fixe et une sous-classe par statut (`errors/*.error.ts`), formatées par un seul `error.middleware` (`71262d3`, `91b6ada`). Les routes sont des descripteurs enregistrés par `builder/route.ts` : c’est l’origine de l’architecture en couches de référence.
- **Base** : Prisma avec l’adaptateur PostgreSQL et un contrôle de santé de la connexion au démarrage (`2a736ba`, `43eded8`). Premier schéma : `User`, `Portfolio`, `Account`.
- **Portefeuilles** : CRUD complet en couches routes → controller → service → repository (`f755727`), avec `utils/handler.ts` pour propager les erreurs asynchrones. Ce modèle appartient à la vision « bourse simulée » ; il est devenu bonus après le pivot.
- **Workspace** : `package.json` racine Bun dont `bun run dev` lance l’API et le web (`85ea872`) ; les `workspaces` `apps/*` et `packages/*` arrivent avec les packages partagés (feature 05).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | Routes déclarées par descripteurs puis enregistrées par un builder. | Un seul endroit pour l’auth et le format des routes. | `71262d3` |
| D2 | Erreurs lancées, formatées uniquement par le middleware. | Réponses d’erreur uniformes. | `91b6ada` |
| D3 | Prisma comme seul accès à la base. | Typage et migrations versionnées. | `2a736ba` |

## Écarts au plan

Le README prévoyait une CI minimale et des ADR initiaux au mois 1 ; ni l’une ni les autres n’ont été réalisés.

## Bilan

Socle livré et toujours en place. Dette : le logger d’origine (`utils/logger.ts`) a été déplacé dans `packages/utils` (feature 05) ; le CRUD de portefeuilles n’est plus utilisé par le parcours principal depuis le pivot.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
