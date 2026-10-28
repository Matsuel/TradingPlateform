# TradingPlateform (MarketFlow)

Monorepo Bun (`workspaces`: `apps/*`, `packages/*`). Plateforme de marché simulée, pilotée par événements Kafka. Vision complète : `README.md`.

Ces règles sont **strictes** : un écart doit être justifié dans le résumé rendu à l'utilisateur. Chaque dossier a son `AGENTS.md` (règles de ses couches) : lis celui du dossier où tu travailles, en plus de celui-ci.

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
| `apps/backtest-engine` | Worker Kafka sans HTTP ni base : consomme `backtest.requested`, calcule, publie le résultat. |
| `apps/market-service` | API de données de marché (yahoo-finance2, port 8001), appelée uniquement via le proxy de core-backend. |
| `apps/web` | Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/base-ui. N'appelle que core-backend. |
| `packages/contracts` | Schémas zod et topics partagés entre services. |
| `packages/kafka` | `KafkaClient`, `KafkaProducer`, `KafkaConsumer`, `createKafkaEvent`. |
| `packages/utils` | `Logger` partagé. |

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
| `apps/web/COMPONENTS.md` | Composants partagés (`components/`), champs de formulaire, formatters de `lib/format.ts`, exports publics de chaque `features/<domaine>`. |

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
- Kafka est **at-least-once** : tout consommateur est idempotent (transitions gardées par statut côté core-backend). Un message invalide est loggué et ignoré, jamais une cause de crash.
- Changer un contrat = mettre à jour producteur **et** consommateur dans le même diff, puis signaler à l'utilisateur de redémarrer les services concernés.
- Chaque champ numérique d'un contrat documente son unité en commentaire (ratio, devise, date `YYYY-MM-DD`).

## Conventions communes

- **Bun partout** : `bun install`, `bun run <script>`, `bun <file>`, `bun test`, `bunx`. Bun charge `.env` : pas de `dotenv`.
- TypeScript `strict`, ESM. `import type` pour les types (`verbatimModuleSyntax`). Pas de `any` dans le nouveau code.
- Indentation 4 espaces dans les apps backend et packages ; `web` suit le style de ses fichiers voisins.
- Logs via `Logger.here()` de `@trading-plateform/utils`.
- Validation des entrées, messages et env avec `zod`.
- Ne commit jamais de `.env` ni de secret.

## Commandes

```bash
bun install
bun run dev            # API + market + web + backtest-engine
bun run dev:backend    # core-backend seul
bun run dev:web        # web seul
bun run dev:backtest   # backtest-engine seul
```

## Avant de rendre la main

Chaque point est vérifié, pas supposé :

1. `bunx tsc --noEmit` passe dans chaque app/package touché ; `bun run lint` dans `apps/web` si le front change ; `bun test` dans `apps/backtest-engine` si l'engine change.
2. Responsabilités : le diff web ne contient que de l'affichage ; tout nouveau calcul vit chez son propriétaire.
3. Rangement : aucune constante, helper ou type dupliqué introduit (`grep` les nouveaux noms et littéraux).
4. Catalogues : chaque route ou composant catalogué créé, modifié ou supprimé a son entrée à jour.
5. Diff relu : rien hors périmètre, aucun fichier généré ou de debug oublié.
