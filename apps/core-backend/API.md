# API core-backend

Catalogue des routes HTTP exposées par core-backend (port 8000) et appelées par le web : comment les appeler sans relire le code. Toute création, modification ou suppression de route met à jour son entrée **dans le même diff que le code**, selon le gabarit ci-dessous. En cas d'écart entre ce fichier et le code, le code fait foi : corrige l'entrée.

## Gabarit d'entrée

````markdown
### METHOD /api/<domaine>/<chemin>

- **Auth** : session better-auth requise (`authMiddleware`) | publique.
- **Entrée** :
  - params : `id` (string, cuid).
  - query : aucune.
  - body : `<schemaZod>` (`interfaces/<domaine>.interface.ts`), champs avec unité.
    ```json
    { "champ": "valeur" }
    ```
- **Réponse** : `200` | `201` | `202` | `204`, forme JSON (types sérialisés : `Decimal` → string, dates → ISO).
  ```json
  { "id": "cm…" }
  ```
- **Erreurs** : `400` → validation ; `401` → pas de session ; `404` → … ; `409` → …
- **Effets** : événement Kafka publié (topic, clé), écritures en base | aucun.
- **Appelant** : `fonction()` de `apps/web/src/features/<domaine>/api.ts`, hook `useX()` de `hook.ts` | aucun.
- **Source** : `routes/<domaine>/<domaine>.routes.ts`, `controller/…`, `services/…`.
````

## Sommaire

- [Conventions communes](#conventions-communes)
- [Auth](#auth) : `ALL /api/auth/{*path}`
- [Market (proxy)](#market-proxy) : `ALL /api/market/{*path}`
- [Portfolio](#portfolio) : `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- [Backtest](#backtest) : `POST`, `POST /:id/executions`, `GET /stats`, `GET /:id`, `GET`

## Conventions communes

- **Base** : `http://localhost:8000`. Le web appelle via `apiFetch(path)` (`apps/web/src/lib/api.ts`) avec `NEXT_PUBLIC_API_URL=http://localhost:8000/api` : `apiFetch("/backtest")` → `GET /api/backtest`. Cookies envoyés (`credentials: "include"`), CORS limité à `env.WEB_URL` (défaut `http://localhost:3000`, `env.ts`).
- **Ordre d'enregistrement** (`index.ts`) : `authRouter`, `marketRouter` (avant `express.json()` pour garder le body brut), puis `express.json()`, `portfolioRouter`, `backtestRouter`, `errorMiddleware`.
- **Auth** : `authMiddleware` lit la session better-auth depuis les en-têtes (cookie, ou `Authorization: Bearer` via le plugin `bearer`) et pose `req.userId`. Sans session : `401 { "error": "Unauthorized" }`.
- **Erreurs** : toute `AppError` est rendue par `error.middleware` en `{ "error": "<message>", ...data }` avec son statut. Toute autre exception : `500 { "error": "Internal server error" }`. Côté web, `apiFetch` lève `Error("Erreur API : <status> <statusText>")` et ignore le corps d'erreur.
- **Sérialisation** : `Decimal` Prisma → string (`"0.001"`), `DateTime` → ISO 8601 (`"2026-01-31T00:00:00.000Z"`). Ratios en fraction (`0.342` = 34,2 %).
- **Propriété** : une ressource d'un autre utilisateur → `403 { "error": "Access denied" }` ; inexistante → `404`.

### Pagination

Les routes de liste (`GET /api/portfolio`, `GET /api/backtest`) suivent le contrat de `packages/contracts/src/pagination.ts` (`@trading-plateform/contracts`) :

- **Query** `paginationQuerySchema` : `page` (int ≥ 1, défaut `1`), `pageSize` (int de 1 à 100, défaut `20`), coercés depuis la query string.
- **Réponse** `Paginated<T>` : `data` (éléments de la page), `count` (total des éléments correspondant au filtre, toutes pages confondues), `page`, `pageSize` (valeurs appliquées, défauts compris).
  ```json
  { "data": [], "count": 42, "page": 3, "pageSize": 20 }
  ```
- Page au-delà de la dernière → `200` avec `data: []` et le `count` réel.
- Query invalide (`page=0`, `pageSize=101`, `page=abc`…) → `400 { "error": "Invalid query", "issues": [ZodIssue] }`.

## Auth

### ALL /api/auth/{*path}

- **Auth** : publique (c'est le point d'entrée de l'authentification).
- **Entrée** : définie par better-auth (`lib/auth.ts`) : email + mot de passe (`emailAndPassword`), plugins `admin`, `jwt`, `bearer`. Routeur monté avant `express.json()` : better-auth lit le body brut.
- **Réponse** : définie par better-auth ; la connexion pose le cookie de session (cache cookie de 5 min, `session.cookieCache.maxAge = 300` s).
- **Erreurs** : format better-auth, pas celui de `error.middleware`.
- **Effets** : écritures `User`, `Account`, `Session`, `Verification`, `Jwks` via `prismaAdapter`. Aucun événement Kafka.
- **Appelant** : `authClient` de `apps/web/src/lib/auth.ts` (better-auth/react, `baseURL: "http://localhost:8000"`, `basePath` par défaut `/api/auth`, plugin `adminClient`) :
  - `signIn.email({ email, password })` : `login` de `features/auth/api.ts`, via `useLogin` dans `LoginForm` ;
  - `signUp.email({ name, email, password })` : `register` de `features/auth/api.ts`, via `useRegister` dans `RegisterForm` ;
  - `signOut()` : `components/nav-user.tsx` ;
  - `authClient.getSession(...)` côté serveur : `getSession`/`requireSession`/`isAdmin` de `apps/web/src/lib/session.ts`, utilisés par `apps/web/src/app/app/layout.tsx` et `apps/web/src/app/app/(admin)/layout.tsx`.
- **Source** : `routes/auth/auth.routes.ts`, `controller/auth.controller.ts`, `lib/auth.ts`.

## Market (proxy)

### ALL /api/market/{*path}

- **Auth** : session requise (`authMiddleware`).
- **Entrée** : requête relayée telle quelle (méthode, chemin complet `/api/market/...`, query, body) vers `env.MARKET_SERVICE_URL` (défaut `http://localhost:8001`, `env.ts`). L'en-tête `x-user-id` entrant est supprimé puis remplacé par `req.userId` (anti-usurpation).
- **Réponse** : statut et corps de market-service, inchangés. Routes disponibles : voir [`apps/market-service/API.md`](../market-service/API.md).
- **Erreurs** : `401` → pas de session ; `502 { "error": "Service unavailable" }` → market-service injoignable ou sans réponse sous 10 s (`proxyTimeout: 10_000`) ; erreurs de market-service relayées avec leur statut.
- **Effets** : aucun.
- **Appelant** : fonctions de `apps/web/src/features/market/api.ts` (détail dans `apps/market-service/API.md`).
- **Source** : `routes/market/market.routes.ts`, `utils/proxy.ts`, `env.ts`.

## Portfolio

Réponse `Portfolio` commune :

```json
{ "id": "cm…", "userId": "…", "name": "Principal", "createdAt": "2026-10-28T09:00:00.000Z", "updatedAt": "2026-10-28T09:00:00.000Z" }
```

### POST /api/portfolio

- **Auth** : session requise.
- **Entrée** : body `portfolioSchema` (`interfaces/portfolio.interface.ts`) : `name` string non vide.
  ```json
  { "name": "Principal" }
  ```
- **Réponse** : `201`, `Portfolio` créé.
- **Erreurs** : `400 { "error": "Name is required" }` → body absent ou invalide (`name` absent, vide ou non string ; pas de `issues`) ; `401`.
- **Effets** : écrit un `Portfolio` (`userId` = session). Aucun événement.
- **Appelant** : aucun.
- **Source** : `routes/portfolio/portfolio.routes.ts`, `controller/portfolio.controller.ts`, `services/portfolio.service.ts`.

### GET /api/portfolio

- **Auth** : session requise.
- **Entrée** : query `page`, `pageSize` ([Pagination](#pagination)).
- **Réponse** : `200`, `Paginated<Portfolio>` ([Pagination](#pagination)) : portefeuilles de l'utilisateur, plus récents d'abord (`createdAt desc`).
  ```json
  { "data": [{ "id": "cm…", "name": "Principal", "...": "…" }], "count": 1, "page": 1, "pageSize": 20 }
  ```
- **Erreurs** : `400 { "error": "Invalid query", "issues": [ZodIssue] }` → pagination invalide ; `401`.
- **Effets** : aucun.
- **Appelant** : aucun.
- **Source** : `routes/portfolio/portfolio.routes.ts`, `controller/portfolio.controller.ts`, `services/portfolio.service.ts`.

### GET /api/portfolio/:id

- **Auth** : session requise.
- **Entrée** : params `id` (cuid du portefeuille).
- **Réponse** : `200`, `Portfolio`.
- **Erreurs** : `401` ; `403 { "error": "Access denied" }` → autre propriétaire ; `404 { "error": "Portfolio not found" }`.
- **Effets** : aucun.
- **Appelant** : aucun.
- **Source** : `routes/portfolio/portfolio.routes.ts`, `controller/portfolio.controller.ts`, `services/portfolio.service.ts`.

### PATCH /api/portfolio/:id

- **Auth** : session requise.
- **Entrée** : params `id` ; body `portfolioSchema` (`interfaces/portfolio.interface.ts`) : `name` string non vide, **requis** (pas de mise à jour partielle).
- **Réponse** : `200`, `Portfolio` mis à jour.
- **Erreurs** : `400 { "error": "Name is required" }` → body absent ou invalide ; `401` ; `403 { "error": "Access denied" }` ; `404 { "error": "Portfolio not found" }`.
- **Effets** : met à jour `Portfolio.name`.
- **Appelant** : aucun.
- **Source** : `routes/portfolio/portfolio.routes.ts`, `controller/portfolio.controller.ts`, `services/portfolio.service.ts`.

### DELETE /api/portfolio/:id

- **Auth** : session requise.
- **Entrée** : params `id`.
- **Réponse** : `204`, corps vide.
- **Erreurs** : `401` ; `403 { "error": "Access denied" }` ; `404 { "error": "Portfolio not found" }`.
- **Effets** : supprime le `Portfolio` et, en cascade, ses `TradingAccount`.
- **Appelant** : aucun.
- **Source** : `routes/portfolio/portfolio.routes.ts`, `controller/portfolio.controller.ts`, `services/portfolio.service.ts`.

## Backtest

Formes de réponse communes (`interfaces/backtest.interface.ts`, `prisma/schema.prisma`) :

- **`Backtest`** : `id`, `userId`, `name`, `symbols` (string[]), `startDate`, `endDate` (ISO), `investmentMode` (`"LUMP_SUM"` | `"RECURRING"`), `initialAmount` (Decimal string, devise de saisie), `recurringAmount` (Decimal string | null, montant par versement), `investmentFrequency` (`"DAILY"` | `"WEEKLY"` | `"MONTHLY"` | `"YEARLY"` | null), `feeRate` (Decimal string, fraction : `"0.001"` = 0,1 % par achat), `latestExecutionId` (string | null, id de la dernière exécution créée : sert au filtre `status` et aux stats), `createdAt`, `updatedAt`.
- **`BacktestExecution`** : `id`, `backtestId`, `status` (`"PENDING"` | `"RUNNING"` | `"COMPLETED"` | `"FAILED"` | `"CANCELLED"`), `attempt` (int, 1 pour la première), `startedAt`, `finishedAt` (ISO | null), `error` (string | null), `createdAt`.
- **Résumé de résultat** (dans `executions[].result`, sans `equityCurve`, `trades`, `holdings` ni `lumpSumComparison`) : `id`, `executionId`, `finalValue`, `totalInvested` (Decimal string | null, devise, frais compris), `totalFees` (Decimal string | null, devise, somme des frais d'achat inclus dans `totalInvested` ; null pour les résultats antérieurs), `profit` (Decimal string | null, devise, valeur finale − total versé ; null pour les résultats antérieurs), `totalReturn` (Decimal string | null, fraction), `totalTrades` (int), `maxDrawdown` (Decimal string | null, fraction ≤ 0, hors versements), `maxDrawdownDate` (ISO | null), `createdAt`.
- **`BacktestResult`** complet : résumé + `equityCurve` (`[{ "date": "YYYY-MM-DD", "value": number, "invested": number, "lumpSumValue"?: number }]`, `lumpSumValue` = valeur de l'investissement unique, présent en DCA seulement), `trades` (`[{ "date": "YYYY-MM-DD", "symbol": string, "price": number, "quantity": number, "amount": number, "fee": number }]`, achats exécutés : `price` = cours d'achat, `quantity` = titres achetés (fractionnaire), `amount` = montant versé frais compris, `fee` = frais ; `quantity`, `amount`, `fee` absents des résultats antérieurs) et `holdings` (`[{ "symbol": string, "quantity": number, "value": number }]`, positions finales valorisées au dernier cours ; `[]` pour les résultats antérieurs) et `lumpSumComparison` (`{ "finalValue": number, "totalReturn": number, "maxDrawdown": number, "dcaAdvantage": number }` | null : même total versé investi en une fois au premier jour, mêmes frais, courbe dans `equityCurve[].lumpSumValue` ; ratios en fraction ; `dcaAdvantage` = valeur finale DCA − investissement unique, > 0 si le DCA fait mieux ; null hors DCA et pour les résultats antérieurs).

Les montants sont dans la devise saisie, affichée `EUR` par le web (`BACKTEST_CURRENCY`) ; les cours ne sont pas convertis.

### POST /api/backtest

- **Auth** : session requise.
- **Entrée** : body `createBacktestSchema` (`interfaces/backtest.interface.ts`) :
  - `name` : string non vide ;
  - `strategy` : `"dca"` (versement mensuel de `amount`) | `"lump_sum"` (versement unique de `amount`) ;
  - `symbols` : string[] non vide ;
  - `start`, `end` : dates (coercées depuis ISO), `start < end` ;
  - `amount` : number > 0, devise de saisie ;
  - `fee` : number de 0 à 100, **pourcentage** par ordre (`0.1` = 0,1 %), stocké en `feeRate = fee / 100`.
  ```json
  { "name": "Test rapide AAPL", "strategy": "dca", "symbols": ["AAPL"], "start": "2025-10-28T00:00:00.000Z", "end": "2026-10-28T00:00:00.000Z", "amount": 10000, "fee": 0.1 }
  ```
- **Réponse** : `202`, `Backtest` créé avec `executions: [execution PENDING, attempt 1, result null]`. Le calcul est asynchrone : suivre via `GET /api/backtest/:id`.
  ```json
  { "id": "cm…", "name": "Test rapide AAPL", "investmentMode": "RECURRING", "initialAmount": "0", "recurringAmount": "10000", "investmentFrequency": "MONTHLY", "feeRate": "0.001", "...": "…", "executions": [{ "id": "cm…", "status": "PENDING", "attempt": 1, "result": null, "...": "…" }] }
  ```
- **Erreurs** : `400 { "error": "Invalid backtest", "issues": [ZodIssue] }` → body invalide (`end` avant `start` : issue sur `path: ["end"]`, `"Must be after start"`) ; `401` ; `500 { "error": "Backtest could not be queued" }` → publication Kafka impossible (le backtest reste créé, son exécution passe `FAILED`).
- **Effets** : écrit `Backtest` (`dca` → `investmentMode: RECURRING`, `initialAmount: 0`, `recurringAmount: amount`, `investmentFrequency: MONTHLY` ; `lump_sum` → `LUMP_SUM`, `initialAmount: amount`) et une `BacktestExecution` `PENDING`. Publie `backtest.requested` (clé `executionId`, payload `BacktestRequestedPayload` de `@trading-plateform/contracts`). Les événements `backtest.started|completed|failed` font ensuite évoluer l'exécution.
- **Appelant** : `createBacktest(values)` de `apps/web/src/features/backtest/api.ts`, hook `useCreateBacktest()` (invalide `["backtest", "list"]` et `["backtest", "stats"]`) ; utilisé par `NewBacktestForm` et `QuickBacktestForm`.
- **Source** : `routes/backtest/backtest.routes.ts`, `controller/backtest.controller.ts`, `services/backtest.service.ts`, `interfaces/backtest.interface.ts`.

### POST /api/backtest/:id/executions

- **Auth** : session requise.
- **Entrée** : params `id` (cuid du backtest) ; pas de body.
- **Réponse** : `202`, `BacktestExecution` créée (`status: "PENDING"`, `attempt` = dernière + 1).
  ```json
  { "id": "cm…", "backtestId": "cm…", "status": "PENDING", "attempt": 2, "startedAt": null, "finishedAt": null, "error": null, "createdAt": "…" }
  ```
- **Erreurs** : `401` ; `403 { "error": "Access denied" }` ; `404 { "error": "Backtest not found" }` ; `409 { "error": "An execution is already in progress", "executionId": "…" }` → dernière exécution `PENDING` ou `RUNNING` (`ACTIVE_STATUSES`) ; `500 { "error": "Backtest could not be queued" }` → publication Kafka impossible (l'exécution passe `FAILED`).
- **Effets** : écrit une `BacktestExecution`, publie `backtest.requested` (clé `executionId`) avec les paramètres stockés du backtest.
- **Appelant** : `rerunBacktest(id)` de `apps/web/src/features/backtest/api.ts`, hook `useRerunBacktest(id)` (invalide `["backtest"]`) ; utilisé par `BacktestDetail`.
- **Source** : `routes/backtest/backtest.routes.ts`, `controller/backtest.controller.ts`, `services/backtest.service.ts`, `constants/backtest.constants.ts`.

### GET /api/backtest/stats

- **Auth** : session requise.
- **Entrée** : aucune. Route enregistrée avant `/:id` (sinon `stats` serait lu comme un id).
- **Réponse** : `200`, `BacktestStats` (`interfaces/backtest.interface.ts`) : backtests de l'utilisateur comptés selon le statut de leur **dernière** exécution. `total` = tous les backtests ; `active` = dernière exécution `PENDING` ou `RUNNING` (`ACTIVE_STATUSES`) ; `completed` = `COMPLETED` ; `failed` = `FAILED` ; `completedRate` = `completed / total`, `failedRate` = `failed / total` (fractions non arrondies, `0` si `total = 0`).
  ```json
  { "total": 13, "active": 6, "completed": 5, "failed": 2, "completedRate": 0.38461538461538464, "failedRate": 0.15384615384615385 }
  ```
- **Erreurs** : `401`.
- **Effets** : aucun.
- **Appelant** : `getBacktestStats()` de `apps/web/src/features/backtest/api.ts`, hook `useBacktestStats()` (clé `["backtest", "stats"]`) ; utilisé par `BacktestList` → `BacktestStats`.
- **Source** : `routes/backtest/backtest.routes.ts`, `controller/backtest.controller.ts`, `services/backtest.service.ts`, `repositories/backtest.repository.ts`, `constants/backtest.constants.ts`.

### GET /api/backtest/:id

- **Auth** : session requise.
- **Entrée** : params `id`.
- **Réponse** : `200`, `BacktestDetails` : `Backtest` + `executions` (toutes, plus récente d'abord, chacune avec son résumé de résultat ou `null`) + `result` (`BacktestResult` complet de la dernière exécution `COMPLETED`, ou `null`).
  ```json
  { "id": "cm…", "name": "…", "executions": [{ "status": "COMPLETED", "attempt": 1, "result": { "totalReturn": "0.123456", "totalTrades": 12, "...": "…" } }], "result": { "finalValue": "11234.56", "totalInvested": "10010", "totalFees": "10.01", "profit": "1224.56", "totalReturn": "0.123456", "maxDrawdown": "-0.08", "maxDrawdownDate": "2026-03-10T00:00:00.000Z", "equityCurve": [{ "date": "2025-11-03", "value": 1000, "invested": 1001, "lumpSumValue": 10000 }], "trades": [{ "date": "2025-11-03", "symbol": "AAPL", "price": 268.5, "quantity": 3.720670, "amount": 1000, "fee": 1 }], "holdings": [{ "symbol": "AAPL", "quantity": 41.2, "value": 11234.56 }], "lumpSumComparison": { "finalValue": 11890.2, "totalReturn": 0.187831, "maxDrawdown": -0.12, "dcaAdvantage": -655.64 }, "...": "…" } }
  ```
- **Erreurs** : `401` ; `403 { "error": "Access denied" }` ; `404 { "error": "Backtest not found" }`.
- **Effets** : aucun.
- **Appelant** : `getBacktest(id)` de `apps/web/src/features/backtest/api.ts`, hook `useBacktest(id)` (clé `["backtest", "detail", id]`, rafraîchi toutes les 2 s tant que la dernière exécution est active) ; utilisé par `BacktestDetail`.
- **Source** : `routes/backtest/backtest.routes.ts`, `controller/backtest.controller.ts`, `services/backtest.service.ts`, `repositories/backtest.repository.ts`.

### GET /api/backtest

- **Auth** : session requise.
- **Entrée** : query `backtestListQuerySchema` (`interfaces/backtest.interface.ts`) :
  - `page`, `pageSize` ([Pagination](#pagination)) ;
  - `status` (optionnel) : statuts séparés par des virgules parmi `DRAFT`, `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED` ; ne garde que les backtests dont la **dernière** exécution a l'un de ces statuts (`count` en tient compte). Absent = tous.
  ```
  GET /api/backtest?page=1&pageSize=20&status=PENDING,RUNNING
  ```
- **Réponse** : `200`, `Paginated<BacktestWithExecutions>` ([Pagination](#pagination)) : backtests de l'utilisateur, plus récents d'abord (`createdAt desc`) ; chacun porte `executions` limité à **la dernière** exécution (avec résumé de résultat ou `null`).
  ```json
  { "data": [{ "id": "cm…", "name": "…", "executions": [{ "status": "RUNNING", "attempt": 1, "result": null, "...": "…" }], "...": "…" }], "count": 6, "page": 1, "pageSize": 20 }
  ```
- **Erreurs** : `400 { "error": "Invalid query", "issues": [ZodIssue] }` → pagination invalide ou `status` inconnu (`status=FOO`, `status=PENDING,`) ; `401`.
- **Effets** : aucun.
- **Appelant** : `getBacktests(params)` de `apps/web/src/features/backtest/api.ts`, hook `useBacktests(params)` (clé `["backtest", "list", params]`, `keepPreviousData`) ; utilisé par `BacktestList`.
- **Source** : `routes/backtest/backtest.routes.ts`, `controller/backtest.controller.ts`, `services/backtest.service.ts`, `repositories/backtest.repository.ts`.
