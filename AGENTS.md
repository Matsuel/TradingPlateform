# TradingPlateform (MarketFlow)

Monorepo Bun (`workspaces`: `apps/*`, `packages/*`). Plateforme de marché simulée, pilotée par événements Kafka. Vision complète : `README.md`.

## Règle d'or

**Respecter les conventions déjà en place.** Avant d'écrire du code, lis 2-3 fichiers voisins et copie leur style (nommage, imports, indentation, forme des exports, gestion d'erreurs). Ne pars pas dans tous les sens :

- Garde la structure actuelle des dossiers. Pas de nouveau dossier/couche si une existante convient.
- Pas de refactor, renommage, reformatage ou dépendance hors du périmètre demandé.
- Pas d'abstraction spéculative, de config pour une valeur fixe, de code mort ni de commentaire qui répète le code.
- Réutilise l'existant (`packages/*`, helpers, composants) avant de créer.
- Une tâche = un diff minimal, lisible, cohérent.

## Structure

| Chemin | Rôle |
| --- | --- |
| `apps/core-backend` | API Express 5 + Prisma + better-auth (port 8000). **Référence d'architecture backend.** |
| `apps/backtest-engine` | Worker Kafka : consomme `backtest.requested`, calcule, publie le résultat. Calqué sur core-backend. |
| `apps/web` | Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/base-ui. |
| `packages/contracts` | Schémas zod partagés entre services. |
| `packages/kafka` | `KafkaClient`, `KafkaProducer`, `KafkaConsumer`, types d'événements. |
| `packages/utils` | `Logger` partagé. |

Chaque dossier a son `AGENTS.md`/`CLAUDE.md` : lis celui du dossier où tu travailles.

## Conventions communes

- **Bun partout** : `bun install`, `bun run <script>`, `bun <file>`, `bun test`, `bunx`. Jamais npm/yarn/pnpm/node/ts-node/jest/vitest. Bun charge `.env` : pas de `dotenv`.
- TypeScript `strict`, ESM (`"type": "module"`). `import type` pour les types (`verbatimModuleSyntax`).
- Indentation 4 espaces dans les apps backend et packages ; `web` suit le style de ses fichiers voisins.
- Logs via `Logger.here()` de `@trading-plateform/utils`, jamais `console.log` dans le code livré.
- Code partagé entre apps → `packages/*`, importé par `@trading-plateform/<nom>`. Pas d'import relatif entre apps.
- Événements Kafka : enveloppe `KafkaEvent<T>` (`eventId`, `eventType`, `occurredAt`, `version`, `payload`) de `@trading-plateform/kafka`. Topics en `domaine.action` (`backtest.requested`).
- Validation des entrées/env avec `zod`.
- Ne commit jamais de `.env` ni de secret.

## Commandes

```bash
bun install
bun run dev            # API + web + backtest-engine
bun run dev:backend    # core-backend seul
bun run dev:web        # web seul
bun run dev:backtest   # backtest-engine seul
```

## Avant de rendre la main

- Le code compile (`tsc --noEmit` dans l'app touchée) ; `bun run lint` dans `apps/web` si le front change.
- Relis ton diff : rien de hors périmètre, aucun fichier généré ou debug oublié.
