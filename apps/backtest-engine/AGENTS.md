# backtest-engine

Worker Kafka sans HTTP **et sans base de données**. Consomme `backtest.requested` (publié par core-backend, contient tous les paramètres), récupère les cours via yahoo-finance2, calcule, puis publie `backtest.started` puis `backtest.completed` (résultat) ou `backtest.failed` (cause). Seul core-backend écrit en base. **N'ajoute jamais d'accès DB ici** : s'il manque une donnée, ajoute-la au contrat `backtest.requested`. **Inspiré de `apps/core-backend`** : même découpage en couches, mêmes conventions de nommage et d'erreurs. Lis `../core-backend/AGENTS.md` et reprends ses règles.

## Structure cible (à respecter, ne pas multiplier les dossiers)

```
index.ts           bootstrap : connecte Kafka, abonne, délègue au handler. Aucune logique.
consumers/         <domaine>.consumer.ts : parse l'événement, appelle le service  (≈ controller)
services/          <domaine>.service.ts : orchestration du backtest, métier        (≈ service)
engine/            calcul pur et déterministe (stratégies, portefeuille, métriques) sans I/O
repositories/      I<X>Repository + classe : sources externes en lecture (cours de marché), jamais la DB
publishers/        <domaine>.publisher.ts : publication des événements de sortie (I<X>Publisher)
interfaces/        types du domaine (<domaine>.interface.ts)
errors/            erreurs métier (<nom>.error.ts)
constants/         constantes (<domaine>.constants.ts)
```

Mapping avec core-backend : `routes+controller` → `consumers`, `services` → `services`, `repositories` → `repositories`, `AppError` → erreurs métier typées. Crée un dossier uniquement quand un fichier en a besoin.

## Conventions

- Nommage `<domaine>.<couche>.ts`, `export default` pour la classe/fonction principale, 4 espaces d'indentation.
- `engine/` est pur : mêmes entrées → mêmes sorties (déterminisme), pas de Kafka, pas de DB, pas de `Date.now()`/`Math.random()` sans injection. Facile à tester avec `bun test`.
- Les consumers ne contiennent pas de logique métier ; les services ne connaissent pas `kafkajs`.
- Événements : types et enveloppe `KafkaEvent<T>` depuis `@trading-plateform/kafka` ; schémas partagés dans `@trading-plateform/contracts`. Ne redéfinis pas un type d'événement localement (cf. `BacktestRequestedEvent` dans `index.ts` : à déplacer vers `packages/`).
- Valide chaque message entrant avec `zod` ; un message invalide est loggué et rejeté, il ne doit pas faire planter le worker.
- Kafka = at-least-once : un `backtest.requested` rejoué peut republier ses événements ; core-backend les ignore grâce aux transitions de statut gardées.
- Toute erreur de calcul → publier `backtest.failed` avec la cause, pas de crash silencieux.
- Logs : `Logger.here()` de `@trading-plateform/utils`, pas de `console.log`.
- Pas de nouvelle dépendance sans nécessité ; réutilise `packages/*`.

## Commandes

```bash
bun run index.ts
bun test
bunx tsc --noEmit
```

## Bun

Utilise Bun (`bun`, `bun test`, `bun install`, `bunx`), pas Node/npm/jest. `Bun.file` plutôt que `node:fs`. Pas de `dotenv`.

## Ajouter une feature (checklist)

1. Contrat de l'événement entrant/sortant → `packages/contracts` (schéma zod) et `packages/kafka` (type `KafkaEvent`).
2. `interfaces/<domaine>.interface.ts` pour les types internes.
3. Calcul → `engine/` (pur, testé avec `bun test`).
4. `repositories/` pour les sources externes (données marché), `publishers/` pour les événements sortants, chacun derrière une interface.
5. `services/<domaine>.service.ts` : orchestre repo + engine + publisher.
6. `consumers/<domaine>.consumer.ts` : valide le message (zod), appelle le service, rien d'autre.
7. Brancher le consumer dans `index.ts` (subscribe + consume). Pas de logique dans `index.ts`.

Couches : consumer sans métier ; service sans `kafkajs` ; engine sans I/O ni horloge/aléa implicites.
