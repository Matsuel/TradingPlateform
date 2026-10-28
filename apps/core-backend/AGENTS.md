# core-backend

API Express 5 + Prisma (PostgreSQL) + better-auth, port 8000. **C'est l'architecture de référence du dépôt** : `backtest-engine` et `market-service` s'en inspirent. Ne change pas ce découpage. Respecte `../../AGENTS.md`.

## Architecture en couches

```
routes/<domaine>/   →  controller/  →  services/  →  repositories/  →  prisma
 (descripteurs)        (HTTP)          (métier)       (accès données)
                       consumers/  ↗  (Kafka, ≈ controller)
```

| Dossier | Rôle |
| --- | --- |
| `routes/<domaine>/` | `<domaine>.routes.ts` (descripteurs) + `index.ts` (Router). |
| `controller/` | Classes `<Domaine>Controller` : HTTP uniquement. |
| `consumers/` | `<domaine>.consumer.ts` : messages Kafka, comme un controller. Branchés dans `index.ts`. |
| `services/` | Classes `<Domaine>Service` : toute la logique métier. |
| `repositories/` | Interface `I<Domaine>Repository` + classe : seul lieu où vit `prisma`. |
| `interfaces/` | Schémas zod d'entrée et types/DTO du domaine (`<domaine>.interface.ts`). |
| `constants/` | Constantes métier (`<domaine>.constants.ts`) : statuts, valeurs fixes. |
| `errors/` | Sous-classes de `AppError` (statut HTTP fixe). |
| `middleware/` | `auth`, `error`. |
| `models/`, `builder/`, `utils/` | `AppError`/`RouteDescriptor`, `registerRoutes`, helpers techniques (`asyncHandler`, `db`, `proxyTo`). |
| `lib/`, `types/` | Config better-auth, `kafkaClient`/`producer`/`consumer` (`lib/kafka.ts`), augmentations Express. |
| `prisma/`, `generated/` | Schéma et migrations ; `generated/` ne s'édite jamais. |

## Règles par couche

Chaque couche fait **exactement** son travail ; une ligne qui relève d'une autre couche y est déplacée.

- **Controller** : valide `req` avec le schéma zod de `interfaces/` (`BadRequestError` si invalide), appelle **une** méthode de service, répond (`res.json`, `res.status(201|202)` pour création/asynchrone). Méthodes en propriétés fléchées ; `userId` vient de `req.userId`.
- **Consumer** : valide le message avec le schéma d'événement de `@trading-plateform/contracts`, appelle **une** méthode de service. Message invalide → `logger.warn` et retour, sans exception.
- **Service** : décide. Autorisation (propriétaire → `NotFoundError`/`ForbiddenError` via un seul helper privé `assertOwner` par service), invariants métier, transitions de statut, mapping entrée API → DTO, publication Kafka (`producer` de `lib/kafka.ts` + `createKafkaEvent`), logs. Ne connaît ni `req`/`res` ni `prisma`.
- **Repository** : exécute. Une méthode par besoin d'accès, paramétrée par ce que le service a décidé (les statuts autorisés sont passés en argument, pas choisis ici). Aucune règle métier, aucune `AppError`. Lecture légère (`getById`) pour autoriser/décider, lecture complète (`getDetailsById`) seulement pour la réponse : on ne charge jamais une colonne lourde (JSON de courbe, listes) pour une vérification.
- Les erreurs se **lancent** ; seul `error.middleware` formate la réponse d'erreur.

## Types et données

- DTO dérivés de Prisma (`Prisma.XUncheckedCreateInput`, `Prisma.XGetPayload<{ include }>`) ou des contrats (`Omit<Payload, ...> & {...}`). Les `include`/`omit` réutilisés sont des constantes `satisfies Prisma.XInclude` en tête du repository.
- Décimaux : `Decimal` Prisma (`@db.Decimal`), convertis en `number` uniquement pour construire un payload Kafka. Ratios stockés en fraction (`0.342`), jamais en pourcentage.
- Erreurs disponibles : `BadRequest` 400, `Unauthorized` 401, `Forbidden` 403, `NotFound` 404, `Conflict` 409, `Internal` 500, `BadGateway` 502. Nouvelle erreur → `errors/<nom>.error.ts`.

## Événements consommés : transitions gardées

core-backend est **le seul service qui écrit en base** : les autres services publient, core-backend applique. Chaque transition est un `updateMany` filtré sur les statuts de départ autorisés ; 0 ligne modifiée = événement rejoué ou tardif, loggué et ignoré.

| Événement | Transition `BacktestExecution` |
| --- | --- |
| `backtest.started` | `PENDING` → `RUNNING` |
| `backtest.completed` | `PENDING`/`RUNNING` → `COMPLETED` + `BacktestResult`, dans une transaction |
| `backtest.failed` | `PENDING`/`RUNNING` → `FAILED` |

Invariant : une seule exécution active (`ACTIVE_STATUSES`) par backtest ; une relance pendant une exécution active lève `ConflictError`.

## Migrations

`bun run db:migrate` puis `bun run db:generate`. Une colonne ajoutée à une table non vide est nullable ou a une `@default`. Si `prisma migrate dev` refuse en non-interactif (avertissement de contrainte), écris `prisma/migrations/<timestamp>_<nom>/migration.sql` à la main, applique avec `bunx prisma migrate deploy`, puis vérifie l'absence d'écart avec `bunx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script` (attendu : migration vide).

## Ajouter une feature `<domaine>` (checklist)

1. `prisma/schema.prisma` si nouvelle donnée, puis migration (ci-dessus).
2. `interfaces/<domaine>.interface.ts` : schéma zod d'entrée + types/DTO dérivés.
3. `repositories/<domaine>.repository.ts` : `I<Domaine>Repository` + classe.
4. `services/<domaine>.service.ts` : métier + autorisation, constantes dans `constants/`.
5. `controller/<domaine>.controller.ts`, puis `routes/<domaine>/` (copie `routes/backtest/`), préfixe `/api/<domaine>`, `authMiddleware` ; router enregistré dans `index.ts`. Entrée de chaque route dans `API.md`.
6. Événement publié → contrat dans `packages/contracts`, publication depuis le service. Événement consommé → `consumers/<domaine>.consumer.ts` + abonnement dans `index.ts`.
7. Domaine porté par un microservice HTTP → descripteur `method: "all"` sur `${prefix}/{*path}` avec `authMiddleware` et `handler: proxyTo(env.<SERVICE>_URL)` (cf. `routes/market/`), router enregistré **avant** `express.json()`.
8. Nouvelle env → `env.ts` (zod), lue via `env.<NOM>`.

## Commandes

```bash
bun run index.ts        # démarre l'API (Kafka + base requis)
bun run db:migrate
bun run db:generate
bunx tsc --noEmit
```
