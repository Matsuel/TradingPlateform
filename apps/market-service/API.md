# API market-service

Catalogue des routes internes de market-service (port 8001, données yahoo-finance2). Le web ne les appelle **jamais directement** : il passe par le proxy de core-backend (`GET /api/market/{search,details/:id,defaults}`, liste blanche) (voir [`apps/core-backend/API.md`](../core-backend/API.md#market-proxy)), qui vérifie la session et transmet l'utilisateur dans l'en-tête `x-user-id`. Toute création, modification ou suppression de route met à jour son entrée **dans le même diff que le code**, selon le gabarit ci-dessous. En cas d'écart, le code fait foi : corrige l'entrée.

## Gabarit d'entrée

````markdown
### METHOD /api/market/<chemin>

- **Auth** : aucune ici ; session vérifiée par le proxy core-backend, utilisateur dans `x-user-id` (lu | non lu).
- **Entrée** :
  - params : `id` (…).
  - query : `champ` (type, valeurs admises).
  - body : aucun | schéma zod (`interfaces/market.interface.ts`).
- **Réponse** : `200`, forme JSON avec unités (devise, pourcentage, dates ISO).
  ```json
  [{ "symbol": "AAPL" }]
  ```
- **Erreurs** : `400` → … ; `500` → …
- **Effets** : aucun (lecture yahoo-finance2) | …
- **Appelant** : `fonction()` de `apps/web/src/features/market/api.ts`, hook `useX()` de `hook.ts` | aucun.
- **Source** : `routes/market/market.routes.ts`, `controller/market.controller.ts`, `services/market.service.ts`, `repositories/market.repository.ts`.
````

## Sommaire

- [Conventions communes](#conventions-communes)
- [`GET /api/market/search`](#get-apimarketsearch)
- [`GET /api/market/details/:id`](#get-apimarketdetailsid)
- [`GET /api/market/defaults`](#get-apimarketdefaults)
- [`GET /api/market/closes`](#get-apimarketcloses)
- [`GET /api/market/dividends`](#get-apimarketdividends)

## Conventions communes

- **Chemin** : identique de bout en bout. Web `apiFetch("/market/search?…")` → core-backend `/api/market/search` → market-service `/api/market/search`.
- **Auth** : pas de session ici, mais `x-internal-key` (valeur `INTERNAL_API_KEY`, posée par le proxy) est exigée sur toutes les routes sauf `GET /health` → sinon `401 { "error": "Unauthorized" }`. Ne pas exposer ce service publiquement. `GET /health` → `200 { "status": "ok" }`. Port : `env.PORT` (défaut 8001). `x-user-id` est posé par le proxy mais aucune route ne le lit aujourd'hui.
- **Erreurs** : `AppError` → `{ "error": "<message anglais>", "code": "<CODE>", ...data }` avec son statut (mêmes codes que core-backend, voir son `API.md`) ; toute autre exception (erreur yahoo-finance2) → `500 { "error": "Internal server error", "code": "INTERNAL_ERROR" }`. Seules les routes `GET` ci-dessous existent : une autre méthode ou un autre chemin reçoit la 404 par défaut d'Express (HTML).
- **Types** : schémas zod d'entrée propres au service dans `interfaces/market.interface.ts` (`searchMarketSchema`, `marketIdSchema`, `dailyClosesQuerySchema`) ; `periodSchema` et types de réponse (`MarketData`, `MarketAsset`, `MarketDetails`, `DailyCloses`, `Period`), unités comprises, dans `@trading-plateform/contracts` (`src/market.ts`), partagés avec le web ; pagination (`paginationQuerySchema`, `Paginated<T>`) depuis le même package. Dates sérialisées en ISO 8601. Prix dans la devise de cotation du symbole, sans conversion.
- **Logos** : `logoUrl` vaut `https://img.logo.dev/ticker/<symbol>?token=…&size=64` si `LOGO_DEV_TOKEN` est défini (`env.ts`), sinon absent.

### GET /api/market/search

- **Auth** : aucune ici (proxy core-backend) ; `x-user-id` non lu.
- **Entrée** : query `searchMarketSchema` : `query` (string, au moins 2 caractères après `trim`).
- **Réponse** : `200`, `MarketData[]` : résultats yahoo `search` issus de Yahoo Finance (`isYahooFinance`), limités à ceux qui ont `name`, `exchange` et `assetType`. `name` = `shortname`, sinon `longname`, sinon `symbol` ; `assetType` = `quoteType` yahoo.
  ```json
  [{ "symbol": "AAPL", "name": "Apple Inc.", "exchange": "NMS", "assetType": "EQUITY", "logoUrl": "https://img.logo.dev/ticker/AAPL?token=…&size=64" }]
  ```
- **Erreurs** : `400 { "error": "Invalid query", "code": "INVALID_QUERY" }` → `query` absent ou trop court ; `500` → erreur yahoo-finance2.
- **Effets** : aucun.
- **Appelant** : `getSearchAssets(query)` de `apps/web/src/features/market/api.ts`, hook `useMarketSearch(query)` (clé `["market", "search", query]`, actif si `query.length >= MIN_SEARCH_LENGTH`, soit 3) ; utilisé par `SymbolPicker` (donc `SymbolSearch` et `SymbolsField`).
- **Source** : `routes/market/market.routes.ts`, `controller/market.controller.ts` (`searchMarket`), `services/market.service.ts`, `repositories/market.repository.ts`.

### GET /api/market/details/:id

- **Auth** : aucune ici (proxy core-backend) ; `x-user-id` non lu.
- **Entrée** :
  - params : `id` (`marketIdSchema`, string non vide après `trim`) = symbole yahoo (`AAPL`, `BTC-USD`, `^GSPC`), encodé par l'appelant (`encodeURIComponent`) ;
  - query : `period` (`periodSchema`) **requis** : `"1d"` (24 h, points de 5 min), `"1w"` (7 jours, 1 h), `"1m"` (1 mois, 1 jour), `"1y"` (1 an, 1 semaine), `"max"` (depuis 1970, 1 mois).
- **Réponse** : `200`, `MarketDetails[]` : un point par intervalle, `date` ISO, `price` = cours de clôture dans la devise de cotation (`close` yahoo) ; un intervalle sans clôture est omis.
  ```json
  [{ "date": "2026-10-28T13:30:00.000Z", "price": 268.41 }]
  ```
- **Erreurs** : `400 { "error": "Invalid query", "code": "INVALID_QUERY" }` → `id` vide après `trim` ; `400 { "error": "Invalid query", "code": "INVALID_QUERY", "issues": [ZodIssue] }` → `period` absent ou hors liste ; `500` → symbole inconnu ou erreur yahoo-finance2.
- **Effets** : aucun.
- **Appelant** : `getAssetsDetails(symbol, period)` de `apps/web/src/features/market/api.ts`, hook `useMarketDetails(symbol, period)` (clé `["market", "detail", symbol, period]`, `staleTime` 60 s, `keepPreviousData`) ; utilisé par `PriceChart` (`features/market/price-chart.tsx`).
- **Source** : `routes/market/market.routes.ts`, `controller/market.controller.ts` (`getMarketDetails`), `services/market.service.ts`, `repositories/market.repository.ts`.

### GET /api/market/defaults

- **Auth** : aucune ici (proxy core-backend) ; `x-user-id` non lu.
- **Entrée** : query `paginationQuerySchema` (`@trading-plateform/contracts`), valeurs coercées depuis la query string :
  - `page` (entier ≥ 1, défaut `1`) ;
  - `pageSize` (entier de 1 à 100, défaut `20`).
- **Réponse** : `200`, `Paginated<MarketAsset>` (`@trading-plateform/contracts`). La pagination porte sur les 15 symboles de `DEFAULT_TICKERS` (`constants/market.constants.ts`), dans cet ordre : seuls les symboles de la page demandée sont interrogés sur yahoo-finance2.
  - `count` : nombre total de symboles par défaut (`DEFAULT_TICKERS.length`, soit 15), toutes pages confondues ;
  - `page`, `pageSize` : valeurs appliquées (défauts inclus) ;
  - `data` : `MarketAsset[]` de la page ; `[]` si `page` dépasse la dernière page (`200`, pas d'erreur). Un symbole en échec est omis (loggué en `error`) sans faire échouer la route : `data.length` peut alors être inférieur à `pageSize` même hors dernière page, et ne doit pas servir à calculer le nombre de pages (utiliser `count`).
  - `price` : `regularMarketPrice`, devise de cotation | null ;
  - `change24h` : `regularMarketChangePercent`, **pourcentage** (`1.5` = +1,5 %) | null ;
  - `volume24h` : `regularMarketVolume`, nombre d'unités échangées | null ;
  - `history` : `MarketDetails[]` des dernières 24 h, points horaires, clôtures `null` exclues.
  ```json
  // GET /api/market/defaults?page=1&pageSize=5
  {
    "data": [{ "symbol": "AAPL", "name": "Apple Inc.", "price": 268.41, "change24h": 1.23, "volume24h": 41234567, "history": [{ "date": "2026-10-27T14:30:00.000Z", "price": 266.9 }], "logoUrl": "https://img.logo.dev/ticker/AAPL?token=…&size=64" }],
    "count": 15,
    "page": 1,
    "pageSize": 5
  }
  ```
- **Erreurs** : `400 { "error": "Invalid query", "code": "INVALID_QUERY", "issues": [ZodIssue] }` → `page` ou `pageSize` non entier ou hors bornes ; `500` seulement sur exception inattendue (échecs par symbole absorbés).
- **Effets** : aucun.
- **Appelant** : `getDefaultAssets(params)` de `apps/web/src/features/market/api.ts`, hook `useDefaultAssets(params)` (clé `["market", "list", params]`, `keepPreviousData`, rafraîchi toutes les 30 s) ; utilisé par `MarketList` (`features/market/market-list.tsx`).
- **Source** : `routes/market/market.routes.ts`, `controller/market.controller.ts` (`getDefaultsAssets`), `services/market.service.ts` (`getDefaultsMarketAssets`, découpage de la page), `repositories/market.repository.ts` (`getAssets`), `constants/market.constants.ts`.

### GET /api/market/closes

- **Auth** : `x-internal-key` (comme toute route). Appelée par **backtest-engine** directement, pas par le web ni le proxy.
- **Entrée** :
  - query : `symbols` (liste séparée par des virgules, 1 à `MAX_CLOSES_SYMBOLS` = 50, doublons retirés), `start` et `end` (ISO UTC avec `Z`, `start` < `end`).
- **Réponse** : `200`, `DailyCloses` : pour chaque symbole demandé, ses clôtures journalières triées par date, dans la devise de cotation. `date` = jour de cotation dans le fuseau de la place (`YYYY-MM-DD`), jamais en UTC ; clôtures ajustées des splits, pas des dividendes ; jours sans clôture omis. Un titre coté en sous-unité (`GBp`, `ILA`, `ZAc`) est rendu dans sa devise principale (÷ 100), comme `currency` de `dividends`. Jamais mis en cache.
  ```json
  // GET /api/market/closes?symbols=AAPL&start=2024-01-02T00:00:00.000Z&end=2024-01-10T00:00:00.000Z
  { "AAPL": [{ "date": "2024-01-02", "close": 185.64 }, { "date": "2024-01-03", "close": 184.25 }] }
  ```
- **Erreurs** : `400 { "error": "Invalid query", "code": "INVALID_QUERY", "issues": [ZodIssue] }` → `symbols` vide ou trop long, date non ISO, `start` ≥ `end` ; `500` → symbole inconnu ou erreur yahoo-finance2.
- **Effets** : aucun.
- **Appelant** : `MarketRepository.getDailyCloses` de `apps/backtest-engine/repositories/market.repository.ts`.
- **Source** : `routes/market/market.routes.ts`, `controller/market.controller.ts` (`getDailyCloses`), `services/market.service.ts`, `repositories/market.repository.ts` (`getDailyCloses`), `interfaces/market.interface.ts` (`dailyClosesQuerySchema`).

### GET /api/market/dividends

- **Auth** : `x-internal-key` (comme toute route). Appelée par **backtest-engine** directement, pas par le web ni le proxy.
- **Entrée** : query `dailyClosesQuerySchema`, identique à `closes` : `symbols` (1 à `MAX_CLOSES_SYMBOLS`), `start` et `end` (ISO UTC avec `Z`, `start` < `end`).
- **Réponse** : `200`, `Dividends` : pour chaque symbole demandé, sa devise de cotation (`currency`, ISO 4217, devise principale : `GBp` → `GBP`, montants ÷ 100) et ses dividendes triés par date (`chart` yahoo avec `events: 'div'`). `date` = ex-date dans le fuseau de la place (`YYYY-MM-DD`), `amount` = montant par titre dans la devise de cotation. Liste vide sans dividende. Jamais mis en cache.
  ```json
  // GET /api/market/dividends?symbols=AAPL&start=2024-01-02T00:00:00.000Z&end=2024-12-31T00:00:00.000Z
  { "AAPL": { "currency": "USD", "dividends": [{ "date": "2024-02-09", "amount": 0.24 }] } }
  ```
- **Erreurs** : `400 { "error": "Invalid query", "code": "INVALID_QUERY", "issues": [ZodIssue] }` → mêmes cas que `closes` ; `500` → symbole inconnu ou erreur yahoo-finance2.
- **Effets** : aucun.
- **Appelant** : `MarketRepository.getDividends` de `apps/backtest-engine/repositories/market.repository.ts`.
- **Source** : `routes/market/market.routes.ts`, `controller/market.controller.ts` (`getDividends`), `services/market.service.ts`, `repositories/market.repository.ts` (`getDividends`), `interfaces/market.interface.ts` (`dailyClosesQuerySchema`).
