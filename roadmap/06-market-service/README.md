# 06 · Extraction de market-service

- **Statut** : Livrée
- **Roadmap** : Mois 2 — architecture (services aux frontières nettes)
- **Période** : 2026-10-28
- **Branche / PR** : `feat/backtest` — #3 (merge `e67e950`)
- **Points** : 8 (MUST 8) — estimés a posteriori
- **Maquettes** : aucune (parcours Marché inchangé)

## Objectif

Sortir les données de marché de `core-backend` dans un service HTTP dédié, sans changer le parcours utilisateur : le web continue de n’appeler que `core-backend`, qui authentifie puis relaie.

## Comment

- **Service** : `apps/market-service` (Express, port 8001) reprend le domaine marché de `core-backend` en couches (constants, controller, service, repository yahoo-finance2), avec son propre builder de routes, ses erreurs et son `env.ts` (`6a62ca8`, `5a3632d`).
- **Proxy** : `core-backend` monte `routes/market/` en descripteur `method: "all"` sur `/api/market/{*path}`, avec `authMiddleware` et `proxyTo(env.MARKET_SERVICE_URL)` (`utils/proxy.ts`, http-proxy-middleware). Le proxy est enregistré avant `express.json()` pour garder le body intact, supprime tout `x-user-id` entrant et pose celui vérifié par l’auth ; une erreur réseau devient `BadGatewayError` (502) (`5a3632d`).
- **Catalogue** : `apps/market-service/API.md` décrit les routes internes relayées ; `core-backend/AGENTS.md` documente la règle du proxy (étape 7 de la checklist).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | Le web n’appelle que `core-backend` ; les microservices HTTP passent par un proxy authentifié. | Un seul point d’auth et de CORS ; services internes non exposés. | `5a3632d` |
| D2 | Identité transmise par `x-user-id`, réécrite par le proxy. | Le service interne fait confiance à l’en-tête sans pouvoir être usurpé depuis le navigateur. | `5a3632d` |
| D3 | Proxy monté avant `express.json()`. | Le body doit être relayé intact. | `5a3632d` |

## Écarts au plan

Le README prévoyait un service de données de marché persistant ses cours ; l’extraction ne déplace que la lecture directe chez Yahoo (persistance au mois 10).

## Bilan

Extraction livrée sans régression du parcours Marché. `backtest-engine` lit toujours Yahoo directement pour ses clôtures, sans passer par `market-service`.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
