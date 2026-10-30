# 06 · Extraction de market-service — Tâches

> Échelle de points, statuts et définition de terminé commune : [`roadmap/README.md`](../README.md). Points estimés a posteriori.

## Synthèse

| Tâche | Titre | US | Couche | Priorité | Points | Dépend de | Commits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | Domaine marché déplacé dans `market-service` | US-01 | market-service | MUST | 3 | — | `6a62ca8` |
| T-02 | Service autonome et proxy authentifié | US-01 | market-service, core-backend | MUST | 5 | T-01 | `5a3632d` |

**Total** : 8 points — MUST 8, SHOULD 0.

---

## Lot 1 — Service et proxy

### T-01 · Domaine marché déplacé dans `market-service`

- **US** : US-01 · **Priorité** : MUST · **Points** : 3 · **Dépend de** : — · **Commits** : `6a62ca8`
- **Fichiers** : `apps/market-service/{constants,controller,interfaces,repositories,services}/`

Critères d’acceptation :
- [x] Controller, service et repository yahoo-finance2 déplacés depuis `core-backend` ; recherche et détail disponibles.

### T-02 · Service autonome et proxy authentifié

- **US** : US-01 · **Priorité** : MUST · **Points** : 5 · **Dépend de** : T-01 · **Commits** : `5a3632d`
- **Fichiers** : `apps/market-service/{index,env}.ts`, `builder/`, `errors/`, `middleware/`, `API.md`, `AGENTS.md` ; `apps/core-backend/utils/proxy.ts`, `errors/badgateway.error.ts`, `routes/market/`, `env.ts`, `index.ts`, `AGENTS.md`

Critères d’acceptation :
- [x] `market-service` démarre seul (port 8001), erreurs et env validées comme `core-backend`.
- [x] `proxyTo` : timeout, `x-user-id` réécrit, erreur réseau ⇒ `BadGatewayError`.
- [x] Router marché monté avant `express.json()` ; code marché retiré de `core-backend`.
- [x] Script racine qui lance aussi `market-service`.
