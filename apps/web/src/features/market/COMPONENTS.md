# Catalogue web : `features/market`

Écrans et modules de recherche et de consultation des marchés (cours via core-backend, qui relaie market-service). Gabarits d'entrée et catalogue des composants partagés : [`COMPONENTS.md`](../../../COMPONENTS.md#gabarits). Toute création, modification ou suppression d'un export catalogué met à jour son entrée dans le même diff que le code.

### MarketList

- **Import** : `import { MarketList } from "@/features/market/market-list"`.
- **Rôle** : écran marché : `SymbolSearch` à droite, puis `DataTable` des actifs par défaut paginée côté serveur (`useDefaultAssets`, `PAGE_SIZE` par page, page dans l'état du composant) ; clic → `routes.symbol(symbol)`.
- **Props** : aucune.
- **Source** : `src/features/market/market-list.tsx`.

### SymbolDetail

- **Import** : `import { SymbolDetail } from "@/features/market/symbol-detail"`.
- **Rôle** : écran d'un symbole : `PageHeader` (avec `SymbolCell size="lg"` et `SymbolSheet`) puis `PriceChart`.
- **Props** :
  - `symbol` : Symbole yahoo de l'URL.
- **Source** : `src/features/market/symbol-detail.tsx`.

### PriceChart

- **Import** : `import { PriceChart } from "@/features/market/price-chart"`.
- **Rôle** : carte « Prix » d'un symbole avec onglets `FilterTabs` sur `periods` (`1d` par défaut ; libellés `market.periods.*`, pas des points `market.intervals.*`) ; charge via `useMarketDetails`, affiche en `MARKET_CURRENCY`.
- **Props** :
  - `symbol` : Symbole yahoo.
- **Source** : `src/features/market/price-chart.tsx`.

### SymbolSearch

- **Import** : `import { SymbolSearch } from "@/features/market/symbol-search"`.
- **Rôle** : bouton « Rechercher un symbole… » qui ouvre `SymbolPicker` et navigue vers `routes.symbol(symbol)`.
- **Props** : aucune.
- **Source** : `src/features/market/symbol-search.tsx`.

### SymbolSheet

- **Import** : `import { SymbolSheet } from "@/features/market/symbol-sheet"`.
- **Rôle** : bouton « Tester » ouvrant un `AppSheet` « Test rapide · <symbole> » qui contient `QuickBacktestForm`.
- **Props** :
  - `symbol` : Symbole de la page.
- **Source** : `src/features/market/symbol-sheet.tsx`.

### `features/market/api.ts`

- **Import** : `import { getDefaultAssets } from "@/features/market/api"`. Appeler via les hooks. Routes relayées par le proxy core-backend, détail dans `apps/market-service/API.md`.

| Export | Route |
| --- | --- |
| `getDefaultAssets` | `GET /api/market/defaults?page&pageSize` |
| `getAssetsDetails` | `GET /api/market/details/:id?period=` |
| `getSearchAssets` | `GET /api/market/search?query=` |

Source : `src/features/market/api.ts`.

### `features/market/hook.ts`

- **Import** : `import { useDefaultAssets } from "@/features/market/hook"`.

| Export | Clé / comportement |
| --- | --- |
| `useDefaultAssets` | `["market", "list", params]`, rafraîchi toutes les 30 s, page précédente gardée pendant le chargement (`keepPreviousData`). |
| `useMarketDetails` | `["market", "detail", symbol, period]`, `staleTime` 60 s, données précédentes gardées au changement de période. |
| `useMarketSearch` | `["market", "search", query]`, actif si `query.length >= MIN_SEARCH_LENGTH`. |

Source : `src/features/market/hook.ts`.

### `features/market/constants.ts`

- **Import** : `import { MARKET_CURRENCY } from "@/features/market/constants"`.

| Export | Rôle |
| --- | --- |
| `MARKET_CURRENCY` | Devise d'affichage des cours (yahoo ne les convertit pas). |
| `MIN_SEARCH_LENGTH` | Longueur minimale d'une recherche de symbole (le backend exige 2). |
| `periods` | Périodes du graphique, dans l'ordre des onglets ; libellés et pas des points dans `messages/*.json`, namespace `market`. |

Source : `src/features/market/constants.ts`.

### `features/market/column.tsx`

- **Import** : `import { useMarketColumns } from "@/features/market/column"`. Hook : à appeler dans le composant.

| Export | Type | Colonnes |
| --- | --- | --- |
| `useMarketColumns()` | `Column<MarketAsset>[]` | Symbole (`SymbolCell`), Prix (`formatPrice` en `MARKET_CURRENCY`), Variation 24 h (`ChangeCell`, pourcentage), Volume 24 h (`formatVolume`), Tendance (`Sparkline` de `history`, couleur selon le signe de la variation) ; `<Dash />` pour une valeur `null` (tendance comprise si la variation est inconnue). En-têtes Prix, Variation, Volume, Tendance en `InfoHint`. |

Source : `src/features/market/column.tsx`.

### `features/market/types.ts`

- **Import** : `import type { MarketAsset, Period } from "@/features/market/types"`. Réexport de `@azimut/contracts` (`src/market.ts`), qui porte les unités.

| Export | Forme |
| --- | --- |
| `Period` | contrat : `"1d" \| "1w" \| "1m" \| "1y" \| "max"` |
| `MarketAsset` | contrat : `{ symbol; name; logoUrl?; price: number \| null; change24h: number \| null (pourcentage, 1,5 = +1,5 %); volume24h: number \| null; history: MarketDetails[] }` (`null` si le fournisseur n'a pas la valeur) |
| `MarketDetails` | contrat : `{ date: string (ISO datetime); price: number }` (intervalles sans clôture omis) |
| `MarketData` | contrat : `{ symbol; name; exchange; assetType; logoUrl? }` |

Source : `src/features/market/types.ts`.
