# TradingPlateform (MarketFlow)

Monorepo Bun (`workspaces`: `apps/*`, `packages/*`). Laboratoire de portefeuille simulé (backtest, risque, optimisation), piloté par événements Kafka. Vision complète : `README.md`.

Ces règles sont **strictes** : un écart doit être justifié dans le résumé rendu à l'utilisateur. Les règles mécaniques (SQL brut, `process.env`, tailles, clés FR/EN…) sont bloquées par `bun run verify` (hook Stop et CI) ; le reste est relu d'après la section « Revue de code » de `CLAUDE.md`. Chaque dossier a son `AGENTS.md` (règles de ses couches) : lis celui du dossier où tu travailles, en plus de celui-ci.

## Règle d'or

**Respecter les conventions déjà en place.** Avant d'écrire du code, lis 2-3 fichiers voisins de la même couche et copie leur forme (nommage, imports, indentation, exports, gestion d'erreurs).

- Garde la structure actuelle des dossiers. Une couche ou un dossier nouveau n'apparaît que si aucun existant ne convient.
- Refactor, renommage, reformatage et nouvelle dépendance restent dans le périmètre demandé.
- Pas d'abstraction spéculative, de config pour une valeur fixe, de code mort ni de commentaire qui répète le code. Un commentaire explique un _pourquoi_ (unité, règle métier, piège).
- Une tâche = un diff minimal, lisible, cohérent.

## Structure

| Chemin | Rôle |
| --- | --- |
| `apps/core-backend` | API Express 5 + Prisma + better-auth (port 8000). **Référence d'architecture backend**, seul accès à la base. |
| `apps/backtest-engine` | Worker Kafka sans serveur HTTP ni base : consomme `backtest.requested`, lit les cours auprès de market-service, calcule, publie le résultat. |
| `apps/market-service` | **Seul service qui appelle yahoo-finance2** (port 8001, cache mémoire) : appelé via le proxy de core-backend pour le web, directement par backtest-engine pour les cours d'un backtest. |
| `apps/web` | Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/base-ui. N'appelle que core-backend. |
| `packages/contracts` | Schémas zod et topics partagés entre services. |
| `packages/kafka` | `KafkaClient`, `KafkaProducer`, `KafkaConsumer`, `createKafkaEvent`. |
| `packages/utils` | `Logger` partagé, `onShutdown`, `DAY_MS`, calendrier de simulation (`periodKey`, `businessDays`, `estimateSchedule`). |
| `packages/http` | Socle des services Express : `AppError` et sous-classes, `RouteDescriptor`/`registerRoutes`, `errorMiddleware`. |
| `roadmap/` | Suivi des features : un dossier par feature (`README.md`, `US.md`, `TASKS.md`), maintenu avec le skill `feature-roadmap`. |

## Responsabilités : qui calcule quoi

Chaque valeur a **un seul propriétaire**. Le propriétaire la calcule, la stocke et l'expose ; les autres la lisent.

| Propriétaire | Responsabilité |
| --- | --- |
| `backtest-engine/engine/` | Tout calcul de simulation : valeur, montant investi, rendement, drawdown, ordres, courbes. Pur et testé. |
| `core-backend/services/` | Règles métier : autorisation, transitions de statut, invariants (« une exécution active à la fois »), mapping entrée → DTO, publication d'événements. Seul écrivain en base. |
| `packages/contracts` | Forme et unités des données échangées entre services. |
| `web` | **Affichage** des valeurs reçues de l'API. |

Le web se limite à : formater (devise, date, durée entre deux timestamps), convertir une unité (ratio `0,342` → `34,2 %`), trier/filtrer pour l'affichage, gérer l'état d'interface. Quand l'écran a besoin d'une valeur métier absente de l'API (un total, une métrique, une règle), **ajoute-la côté backend** (engine → contrat → base → API), puis affiche-la. Test rapide : si deux clients différents devaient montrer le même chiffre, ce chiffre vient du backend.

## Catalogues d'usage

Chaque app qui expose quelque chose de réutilisable tient un **catalogue** : comment l'utiliser, sans relire son code.

| Catalogue | Contenu |
| --- | --- |
| `apps/core-backend/API.md` | Routes HTTP appelées par le web : méthode, chemin, auth, entrée, réponse, erreurs, effets (événements publiés), appelant web. |
| `apps/market-service/API.md` | Routes internes relayées par le proxy de core-backend. |
| `apps/web/COMPONENTS.md` | Gabarits d'entrée, sommaire de tout le catalogue web, composants partagés (`components/`), champs de formulaire, formatters de `lib/format.ts`. |
| `apps/web/src/features/<domaine>/COMPONENTS.md` | Exports publics d'une feature web (écrans, sections, `api.ts`, `hook.ts`, `schema.ts`, `constants.ts`, `utils.ts`, `column.tsx`, `types.ts`), référencés par le sommaire de `apps/web/COMPONENTS.md`. |

- **Lis le catalogue d'abord** : avant d'appeler une route, d'utiliser un composant ou d'en créer un, consulte le catalogue concerné. Il fait foi pour l'usage (props, body, réponses).
- **Documente dès la création** : créer, modifier ou supprimer une route ou un composant catalogué met à jour son entrée dans le même diff, selon le gabarit écrit en tête du catalogue.
- Catalogue et code divergent → le code fait foi ; corrige l'entrée dans ton diff.

## Rangement : une signification, un seul endroit

- **Cherche avant de créer** : catalogue d'usage, puis `grep` du nom ou de la valeur. Un helper, une constante ou un composant équivalent existe → réutilise-le ou étends-le.
- **Constantes** : une valeur métier écrite deux fois (statuts, devise, topic, fréquence) devient une constante nommée dans `constants/` (backend) ou `features/<domaine>/constants.ts` (web).
- **Types** : un type qui décrit une donnée d'un contrat ou de Prisma en est **dérivé** (`z.infer`, `Pick`, `Omit`, `Prisma.XGetPayload`), jamais recopié champ par champ.
- **Helpers** : un helper vit dans la couche de sa responsabilité (formatage web → `lib/format.ts`, helper de domaine → `features/<domaine>/utils.ts`, calcul → `engine/`). Code partagé entre apps → `packages/*`, importé par `@trading-plateform/<nom>` ; jamais d'import relatif entre apps.
- **Fichiers** : un fichier = une responsabilité, nommé `<domaine>.<couche>.ts` côté backend. `index.ts` (backend) et `page.tsx` (web) ne font que câbler/composer.

## Contrats et événements Kafka

- Enveloppe `KafkaEvent<T>` (`eventId`, `eventType`, `occurredAt`, `version`, `payload`) via `createKafkaEvent` ; topics `domaine.action` en constantes dans `packages/contracts`.
- Kafka est **at-least-once** : tout consommateur est idempotent (transitions gardées par statut côté core-backend). Un message invalide est loggué et ignoré, jamais une cause de crash. Un handler qui lève (base indisponible…) est loggué avec `topic`, `partition` et `offset` par `KafkaConsumer`, puis l'exception repart à kafkajs, qui rejoue le message.
- Changer un contrat = mettre à jour producteur **et** consommateur dans le même diff, puis signaler à l'utilisateur de redémarrer les services concernés.
- Chaque champ numérique d'un contrat documente son unité en commentaire (ratio, devise, date `YYYY-MM-DD`).

## Conventions communes

- **Tests** : dossier `test/` à la racine de chaque app, fichiers `<sujet>.test.ts`, lancés par `bun test` depuis l'app. Variables d'env factices dans `test/setup.ts` (préchargé par `bunfig.toml`) : un test n'ouvre aucune connexion (base, Kafka). Un repository se teste sur la base `trading_test` (jamais `DATABASE_URL`, forcée par `test/setup.ts` ; `describeWithDb`, vidée entre les tests, tests ignorés si PostgreSQL est éteint). Un service se teste avec un faux repository assigné à `service.repo` ; une route avec `startApp` de `@trading-plateform/http/testing` (vrai Express, service espionné par `spyOn(Service.prototype, …)` restauré en `afterAll`) ; un hook ou composant web avec `@testing-library/react` (`test/render.tsx` fournit le provider de langue). Un comportement ajouté ou une transition modifiée a son test dans le même diff.

- **Bun partout** : `bun install`, `bun run <script>`, `bun <file>`, `bun test`, `bunx`. Bun charge `.env` : pas de `dotenv`.
- TypeScript `strict`, ESM. `import type` pour les types (`verbatimModuleSyntax`). Pas de `any` dans le nouveau code.
- Indentation 4 espaces dans les apps backend et packages ; `web` est formaté par Biome (`bun run format` dans `apps/web`).
- Logs via `Logger.here()` de `@trading-plateform/utils`.
- **Documentation des fonctions** : chaque fonction ou composant exporté dont le rôle ne se lit pas dans son nom porte un JSDoc `/** */` : ce qu'il fait, unités, cas limites (`null`, erreur levée). Pas de JSDoc qui paraphrase la signature.
- **Résultats stockés qui évoluent** : un champ ajouté à un résultat déjà en base est nullable (ou `@default`) côté Prisma et optionnel côté web ; l'écran affiche `<Dash />` ou masque la légende pour un résultat antérieur, sans recalculer la valeur.
- Validation des entrées, messages et env avec `zod`.
- **Base de données : Prisma Client uniquement** (`findMany`, `count`, `groupBy`, `$transaction`…), jamais de SQL écrit à la main (`$queryRaw`, `$executeRaw`, `Prisma.sql` et leurs variantes `Unsafe`). Une requête que l'API Prisma ne sait pas exprimer se règle par le modèle (relation ou champ dénormalisé, maintenu dans le repository), pas par du SQL. Seule exception : le SQL des fichiers de migration (`prisma/migrations/`), y compris un backfill de données.
- Ne commit jamais de `.env` ni de secret. `process.env` ne se lit que dans `env.ts` de l'app ; exception : les packages sans app hôte (`packages/utils` : `LOG_LEVEL`, `NODE_ENV` ; `packages/kafka` : `KAFKA_*`).
- **Cycle de vie** : chaque process lit son port dans `env.ts`, démarre dans un `main().catch(…)` qui met `process.exitCode = 1` (`process.exit(1)` si le serveur écoute déjà : sinon il garde le process en vie à moitié démarré), et enregistre ses fermetures avec `onShutdown` de `@trading-plateform/utils` (`SIGTERM`/`SIGINT`). Un service HTTP expose `GET /health`.

## Commandes

```bash
bun install
bun run dev            # API + market + web + backtest-engine
bun run dev:backend    # core-backend seul
bun run dev:web        # web seul
bun run dev:backtest   # backtest-engine seul
```

## Dette technique

`TECH-DEBT.md` (racine) est le registre de la dette connue. **Tu l'écris toi-même, sans attendre qu'on te le demande** : dès que tu repères une dette que ton diff ne règle pas, tu ajoutes une ligne dans le même diff.

- **Est une dette** : un contournement ou un `TODO` que tu laisses, un test ou une doc que tu n'écris pas faute de périmètre, une duplication ou un écart aux règles de ce fichier que tu constates hors de ton périmètre, un risque (sécurité, perte de données, blocage) que tu aperçois, un seuil de taille dépassé que tu ne découpes pas.
- **N'est pas une dette** : ce que ton diff corrige, une préférence de style, une idée de feature (elle va dans `roadmap/`).
- **Format** : `TD-NN` suivant, gravité (`haute`, `moyenne`, `basse`), zone, ce qui est faux et pourquoi ça coûte, `fichier:ligne`, correction proposée, effort (S, M, L). Cherche d'abord une ligne existante (`grep` du fichier ou du symbole) : complète-la plutôt que d'en ouvrir une seconde.
- **Une dette corrigée** passe dans le tableau « Fermée » (id, date, commit) dans le diff qui la corrige. Une ligne devenue fausse est corrigée ou supprimée.
- Le résumé rendu à l'utilisateur liste les `TD-NN` ajoutés ou fermés.

## Avant de rendre la main

Lance `bun run verify` (le hook Stop le lance aussi) : tsc, lint, format et tests des workspaces touchés, plus les règles mécaniques. Corrige chaque ✗ ; corrige ou justifie chaque ⚠ dans le résumé. Vérifie ensuite à la main ce que le script ne juge pas :

1. Responsabilités : le diff web ne contient que de l'affichage ; tout nouveau calcul vit chez son propriétaire.
2. Rangement : aucune constante, helper ou type dupliqué introduit (`grep` les nouveaux noms et littéraux).
3. Catalogues : chaque route ou composant catalogué créé, modifié ou supprimé a son entrée à jour.
4. Diff relu : rien hors périmètre, aucun fichier généré ou de debug oublié.
5. Dette : toute dette repérée et non corrigée a sa ligne dans `TECH-DEBT.md` ; toute dette corrigée y est fermée.
