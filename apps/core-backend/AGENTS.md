# core-backend

API Express 5 + Prisma (PostgreSQL) + better-auth, port 8000. **C'est l'architecture de référence du dépôt** : `backtest-engine` s'en inspire. Ne change pas ce découpage.

## Architecture en couches

```
routes/<domaine>/   →  controller/  →  services/  →  repositories/  →  prisma
 (descripteurs)        (HTTP)          (métier)       (accès données)
```

| Dossier | Rôle |
| --- | --- |
| `routes/<domaine>/` | `<domaine>.routes.ts` (descripteurs) + `index.ts` (Router). |
| `controller/` | Classes `<Domaine>Controller`, parsing req/res uniquement. |
| `services/` | Classes `<Domaine>Service`, logique métier, erreurs `AppError`. |
| `repositories/` | Interface `I<Domaine>Repository` + classe, seul lieu où vit `prisma`. |
| `interfaces/` | Types/DTO du domaine (`<domaine>.interface.ts`). |
| `middleware/` | Middlewares Express (`auth`, `error`). |
| `errors/` | Sous-classes de `AppError` (statut HTTP fixe). |
| `models/` | `AppError`, `RouteDescriptor`. |
| `builder/` | `registerRoutes`. |
| `constants/` | Constantes (`<domaine>.constants.ts`). |
| `utils/` | Helpers (`asyncHandler`, `db`). |
| `lib/`, `types/` | Config better-auth, augmentations de types Express. |
| `prisma/`, `generated/` | Schéma et migrations ; `generated/` ne s'édite jamais. |

## Conventions

- Nommage fichiers : `<domaine>.<couche>.ts` (`backtest.service.ts`, `backtest.controller.ts`). Suffixe `.route.ts`/`.routes.ts` selon le domaine voisin.
- Un domaine = un fichier par couche. Ajouter une feature = étendre les 4 couches du domaine, pas inventer un nouveau pattern.
- `export default` pour classes/fonctions principales, une par fichier.
- Controllers : méthodes en propriétés fléchées (`getX = async (req, res) => {}`) ; l'`userId` vient de `req.userId`.
- Les erreurs se **lancent** (`throw new NotFoundError(...)`), jamais `res.status(...)` dans service/controller : `error.middleware` formate. Handlers enveloppés par `asyncHandler`.
- Le service vérifie l'autorisation (propriétaire, `ForbiddenError`) ; le repository ne contient aucune règle métier.
- Routes : préfixe `/api/<domaine>`, `middlewares: [authMiddleware]` pour les routes protégées.
- Nouveau router → l'enregistrer dans `index.ts`.
- Env via `env.ts` (zod) ; pas de `process.env` éparpillé.
- Logs : `const logger = Logger.here()` en haut du fichier, `logger.info("Message", { contexte })`.
- Évite `any` dans le nouveau code : types dans `interfaces/` ou types Prisma.
- Modification du schéma : `bun run db:migrate` puis `bun run db:generate`.

## Commandes

```bash
bun run index.ts        # démarre l'API
bun run db:migrate
bun run db:generate
bunx tsc --noEmit
```

## Ajouter une feature `<domaine>` (checklist)

1. `prisma/schema.prisma` si nouvelle donnée, puis `db:migrate` + `db:generate`.
2. `interfaces/<domaine>.interface.ts` : types/DTO (pas de `any`).
3. `repositories/<domaine>.repository.ts` : `I<Domaine>Repository` + classe, seul accès à `prisma`.
4. `services/<domaine>.service.ts` : métier + autorisation, `throw` des erreurs de `errors/`, logs `Logger.here()`.
5. `controller/<domaine>.controller.ts` : méthodes fléchées, validation `zod` des entrées, `res.json`.
6. `routes/<domaine>/<domaine>.routes.ts` + `index.ts` (copie `routes/backtest/`), préfixe `/api/<domaine>`, `authMiddleware`.
7. Enregistrer le router dans `index.ts`.
8. Nouvelle erreur → `errors/<nom>.error.ts` étendant `AppError` ; nouvelle env → `env.ts`.
9. Publier un événement Kafka → via `@trading-plateform/kafka`, type dans `packages/kafka`.

Règles par couche : controller sans métier ni `prisma` ; service sans `req`/`res` ; repository sans règle métier ni `AppError` ; `error.middleware` seul formateur d'erreurs ; jamais `res.status` hors middleware.
