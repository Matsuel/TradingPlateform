# Catalogue web : `features/backtest`

Écrans et sections : composants ci-dessous. Données : modules `api.ts`, `hook.ts`, `schema.ts`, `constants.ts`, `utils.ts`, `column.tsx`, `types.ts`. Rangement : la racine porte les fichiers attitrés et les écrans de liste, détail et formulaire ; `result/` (écran de résultat), `comparison/` (comparaison A/B), `batch/` (lot de départs) et `form/` (sections du formulaire) portent leurs sous-écrans et leurs tables. Gabarits d'entrée et catalogue des composants partagés : [`COMPONENTS.md`](../../../COMPONENTS.md#gabarits). Toute création, modification ou suppression d'un export catalogué met à jour son entrée dans le même diff que le code.


### BacktestList

- **Import** : `import { BacktestList } from "@/features/backtest/backtest-list"`.
- **Rôle** : écran liste : `BacktestStats` (`useBacktestStats`) puis `DataTable` des backtests paginée côté serveur (`useBacktests`, `PAGE_SIZE` par page) et filtrable par statut (filtre envoyé au backend ; changer de filtre revient à la page 1) ; clic → détail. Page et filtre vivent dans l'état du composant.
- **Props** : aucune.
- **Source** : `src/features/backtest/backtest-list.tsx`.

### BacktestDetail

- **Import** : `import { BacktestDetail } from "@/features/backtest/backtest-detail"`.
- **Rôle** : écran détail (maquette 13 v2 · A) : en-tête avec statut, allocation, rebalancement, benchmark, relance et, dès qu'il y a un résultat, bouton vers `BacktestDividends` ; `ResultOverview` (valeur finale, courbes de valeur et de drawdown) ; `ResultMetrics` (indicateurs groupés) ; `TradesTable` (ordres) ; `ResultDetails` (positions, hypothèses, historique repliés). Instancie `useBacktest` et `useRerunBacktest`.
- **Props** :
  - `id` : Id du backtest.
- **Source** : `src/features/backtest/backtest-detail.tsx`.

### BacktestDividends

- **Import** : `import { BacktestDividends } from "@/features/backtest/result/backtest-dividends"`.
- **Rôle** : écran « Dividendes et change » (maquette 31, route `routes.backtestDividends(id)`), ouvert par le bouton « Dividendes et change » du détail (toujours affiché avec un résultat) : quatre `StatCard` (valeur finale, rendement total avec le cours seul, dividendes perçus, effet de change si hors EUR), `ReturnBreakdown`, courbe avec et sans dividendes (`ValueDrawdownCharts` sans drawdown ; absente sans `priceOnlyValue`) et `DividendsTable`. Un résultat antérieur ou sans dividende ni change affiche un `EmptyCard`. Instancie `useBacktest`.
- **Props** :
  - `id` : Id du backtest.
- **Source** : `src/features/backtest/result/backtest-dividends.tsx`.

### ReturnBreakdownCard

- **Import** : `import { ReturnBreakdownCard } from "@/features/backtest/result/return-breakdown"`.
- **Rôle** : carte « Décomposition du rendement » : cours seul, dividendes, rendement local, contribution du change, rendement en EUR, avec une barre proportionnelle à chaque valeur. Composantes en points, totaux en pourcentage ; sans change (`fx` null), lignes « devise locale » et « change » omises.
- **Props** : `breakdown` (`returnBreakdown` du moteur, ratios), `totalReturn` (ratio EUR).
- **Source** : `src/features/backtest/result/return-breakdown.tsx`.

### DividendValueChart

- **Import** : `import { DividendValueChart } from "@/features/backtest/result/dividend-value-chart"`.
- **Rôle** : carte « Valeur du portefeuille » de la page dividendes : courbe avec dividendes réinvestis et, en pointillés, le même portefeuille sans dividendes (`priceOnlyValue`), puis l'écart final (`dividendGain`). Renvoie `null` si aucun point n'a de `priceOnlyValue`.
- **Props** : `result: BacktestResult`.
- **Source** : `src/features/backtest/result/dividend-value-chart.tsx`.

### DividendsTable

- **Import** : `import { DividendsTable } from "@/features/backtest/result/dividends-table"`.
- **Rôle** : table « Dividendes perçus » : ex-date, actif, montant en EUR, parts rachetées ; du plus récent au plus ancien, paginée côté client (`PAGE_SIZE`), puis total et nombre de versements.
- **Props** : `events` (`dividendEvents` du moteur, du plus ancien au plus récent), `total` (`dividendTotal`, Decimal sérialisé ou null).
- **Source** : `src/features/backtest/result/dividends-table.tsx`.

### TradesTable

- **Import** : `import { TradesTable } from "@/features/backtest/result/trades-table"`.
- **Rôle** : table « Ordres » d'un résultat : les 5 plus récents (`RECENT_TRADES`), puis sur « Voir les N ordres » tous, paginés côté client (`paginate`, `PAGE_SIZE`), du plus récent au plus ancien.
- **Props** : `trades: Trade[]`, ordres du moteur du plus ancien au plus récent.
- **Source** : `src/features/backtest/result/trades-table.tsx`.

### StatusBadge

- **Import** : `import { StatusBadge } from "@/features/backtest/status-badge"`.
- **Rôle** : badge du statut d'une exécution, libellé `backtest.status.<statut>` et variante de `statusVariants` (liste, détail, historique).
- **Props** : `status: ExecutionStatus`.
- **Source** : `src/features/backtest/status-badge.tsx`.

### NewBacktestForm

- **Import** : `import { NewBacktestForm } from "@/features/backtest/new-backtest-form"`.
- **Rôle** : formulaire « Nouveau backtest » (maquette 12.1, `createBacktestFormSchema`, sections `GeneralSection` + `AllocationSection`, benchmark proposé `DEFAULT_BENCHMARK_SYMBOL`, `BacktestPreviewSummary` à droite à partir de `lg`, empilé dessous sinon) ; « Lancer le backtest » désactivé tant que `allocationTotal` ≠ 100 ; un `400` du backend place chaque issue sous le champ de son chemin (`setFormIssues`) ; redirige vers le détail créé.
- **Props** : aucune.
- **Source** : `src/features/backtest/new-backtest-form.tsx`.

### BacktestPreviewSummary

- **Import** : `import { BacktestPreviewSummary } from "@/features/backtest/form/preview-summary"`.
- **Rôle** : carte « Récapitulatif » du formulaire « Nouveau backtest » (maquette 12.1), sous `FormProvider` d'un formulaire `BacktestValues` : étapes Données / Simulation / Métriques (`previewSteps`, textes `backtest.preview.steps.*`), puis « Rebalancements prévus », « Versements prévus » et « Source des données » (`dataProviderLabels` · `backtest.priceType.<type>`) renvoyés par `useBacktestPreview` (estimations calendaires du backend, aucun calcul côté web) et mention « Estimation calendaire ». Valeurs validées par `createBacktestFormSchema(t).safeParse` dans `useWatch({ compute })`, appel débouncé de 500 ms (`useDebouncedValue`) ; `<Dash />` tant que le formulaire est invalide ou la réponse absente. Les trois libellés sont des `InfoHint` (`plannedRebalances`, `plannedContributions`, `dataSource`).
- **Props** : aucune.
- **Source** : `src/features/backtest/form/preview-summary.tsx`.

### QuickBacktestForm

- **Import** : `import { QuickBacktestForm } from "@/features/backtest/quick-backtest-form"`.
- **Rôle** : test rapide sur un seul symbole (`createQuickBacktestFormSchema`, nom `backtest.quick.name`, allocation `[{ symbol, weight: 100 }]`, défauts `DEFAULT_INVESTMENT_MODE`, `DEFAULT_INITIAL_AMOUNT`, `DEFAULT_FEE_PERCENT`, 1 an jusqu'à aujourd'hui ; champs `InvestmentModeFields` et `PeriodAndCapitalFields` partagés avec le formulaire complet ; récapitulatif `QuickTestSummary` et boutons `QuickTestActions` internes) ; un `400` du backend place chaque issue sous le champ de son chemin (`setFormIssues`) ; redirige vers le détail créé.
- **Props** :
  - `symbol` : Symbole testé.
- **Source** : `src/features/backtest/quick-backtest-form.tsx`.

### AllocationField

_Ligne et pied du champ : `form/allocation-row.tsx` (`AllocationRow`, `AllocationFooter`, internes à la feature)._

- **Import** : `import { AllocationField } from "@/features/backtest/form/allocation-field"` (seul domaine utilisateur, d'où sa place dans la feature).
- **Rôle** : allocation d'un portefeuille (`AllocationInput[]`) : une ligne par actif (symbole, nom, barre proportionnelle au poids, champ `%` entier de 1 à 100 au pas de 1, bouton de retrait), ajout via `SymbolPicker` (symbole déjà présent masqué et ignoré ; le nouvel actif reçoit le reste jusqu'à 100 %, vide s'il n'en reste pas), badge « Total » vert à 100 %, rouge sinon. Le total n'est qu'un affichage de la saisie : la somme = 100 se valide dans le schéma zod du formulaire.
- **Valeur** : `AllocationInput = Pick<Allocation, "symbol"> & { name?: string; weight: number }` ; `weight` en **pourcent entier** (60 = 60 %, D2), `NaN` quand le champ est vidé (rejeté par `z.number()`) ; `name` sert à l'affichage seulement. Le backend convertit le pourcent en ratio.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `addLabel` | `string` | non | `"Ajouter un actif"` | Libellé du bouton d'ajout. |

- **Erreurs** : une erreur sur toute l'allocation (`path: [<name>]` : vide, total ≠ 100, symbole en double) s'affiche sous le champ ; une erreur sur un poids (`<name>.<index>.weight` : vide, non entier, hors bornes) s'affiche sous sa ligne.
- **Helpers** : `FULL_PERCENT` (`100`, `constants.ts`), `allocationTotal(rows) => number` (`utils.ts`, somme des poids saisis en pourcent, `NaN` compte 0), `AllocationInput` (`types.ts`) ; utilisés par le badge, le schéma du formulaire et pour désactiver l'envoi. Rendu interne : une `AllocationRow` par actif.
- **Accessibilité** : le symbole et le nom de chaque ligne sont le `label` de son champ `%` (`id` = `<name>.<index>.weight`, qui reçoit `aria-invalid` si l'erreur zod porte sur ce poids) ; bouton de retrait `aria-label="Retirer <symbole>"` ; badge « Total » en `aria-live="polite"`.
- **Source** : `src/features/backtest/form/allocation-field.tsx`.

### GeneralSection

- **Import** : `import { GeneralSection } from "@/features/backtest/form/sections"`.
- **Rôle** : section « Général » (`name`, puis `InvestmentModeFields`) d'un formulaire `BacktestValues`, sous `FormProvider`.
- **Props** : `PeriodAndCapitalFields({ afterPeriod?: ReactNode })` ; `InvestmentModeFields` : aucune.
- **Source** : `src/features/backtest/form/sections.tsx`.

### AllocationSection

- **Import** : `import { AllocationSection } from "@/features/backtest/form/sections"`.
- **Rôle** : section « Allocation et période » (`allocations` via `AllocationField`, `PeriodAndCapitalFields`, `rebalanceFrequency` via `SelectField` « Rebalancement », aide « Ramène les poids à la cible », `benchmarkSymbols` via `SymbolsField` « Benchmark » à un symbole au plus, retirable pour simuler sans benchmark) d'un formulaire `BacktestValues`.
- **Props** : aucune.
- **Source** : `src/features/backtest/form/sections.tsx`.

### InvestmentModeFields, PeriodAndCapitalFields

- **Import** : `import { InvestmentModeFields, PeriodAndCapitalFields } from "@/features/backtest/form/sections"`.
- **Rôle** : champs communs au formulaire complet et au test rapide, sous `FormProvider`. `InvestmentModeFields` : mode d'investissement, puis versement mensuel en `RECURRING` seulement. `PeriodAndCapitalFields` : début et fin, puis `afterPeriod` (nœud optionnel : l'interrupteur de lot du formulaire complet), capital initial et frais par ordre (aide `feeRate`). Montants libellés avec `currencySymbol(BACKTEST_CURRENCY)`.
- **Props** : aucune.
- **Source** : `src/features/backtest/form/sections.tsx`.

### ResultOverview

- **Import** : `import { ResultOverview } from "@/features/backtest/result/result-overview"`.
- **Rôle** : carte principale d'un résultat : « Valeur finale » (`text-h1`), badge du rendement total, plus-value sur le montant investi (et rendement du benchmark s'il existe), légende des séries (Portefeuille, benchmark ou investissement unique, Drawdown ; libellés `InfoHint`, maquette 15.1), puis `ValueDrawdownCharts` (courbe de valeur, et drawdown dessous sur le même axe). En-tête interne : `ResultHeadline` (valeur finale, badge) et `ProfitLine`. Série en pointillés : benchmark (`benchmarkValue`) s'il existe, sinon investissement unique (`lumpSumValue`, DCA). Drawdown masqué si aucun point ne porte `drawdown` (résultat antérieur).
- **Props** :
  - `result` : Résultat complet.
- **Source** : `src/features/backtest/result/result-overview.tsx`.

### ValueDrawdownCharts

- **Import** : `import { ValueDrawdownCharts } from "@/features/backtest/result/value-drawdown-charts"`.
- **Rôle** : courbe de valeur (montants `formatAmount`, `h-56`) puis, dessous et sur le même axe des dates, drawdown (`formatRate` en axe, `formatRatio` en infobulle, `h-24`). `drawdown.data` vide (résultat antérieur) : seule la valeur s'affiche, avec son axe.
- **Props** : `value` et `drawdown`, chacun `{ data: ChartPoint[]; series: ChartSeries[] }` (voir `AreaSeriesChart`).
- **Source** : `src/features/backtest/result/value-drawdown-charts.tsx`.

### MetricBlock

- **Import** : `import { MetricBlock, type MetricColumn, type MetricRow } from "@/features/backtest/metric-block"`.
- **Rôle** : carte d'indicateurs en liste : titre, description, une ligne par métrique (badge optionnel après le libellé), une colonne de valeurs par série (ex. portefeuille puis benchmark) ; `boldColumns` premières colonnes en gras, suivantes en retrait ; note optionnelle sous la liste. Valeurs déjà formatées.
- **Props** :
  - `title` : Titre de la carte.
  - `description` (optionnel) : Sous le titre.
  - `columns` : En-tête de chaque colonne de valeurs ; `hint` ouvre l'aide de l'en-tête (ex. « Écart »).
  - `rows` : `values` dans l'ordre de `columns` ; avec `hint`, le libellé est un `InfoHint` dont le panneau rappelle la valeur de chaque colonne puis `details` ; `badge` après le libellé (ex. « diffère »).
  - `boldColumns` (optionnel) : Nombre de premières colonnes en gras ; `0` = toutes en retrait.
  - `rowHeader` (optionnel) : En-tête visible de la colonne des libellés.
  - `note` (optionnel) : Texte sous la liste.
- **Source** : `src/features/backtest/metric-block.tsx` (ligne rendue par `MetricBlockRow`, interne).

### ResultDetails

- **Import** : `import { ResultDetails } from "@/features/backtest/result/result-details"`.
- **Rôle** : carte de sections repliables (`ui/collapsible`) en bas du détail : « Positions finales » (`DataTable` sans `TableCard`, `holdingColumns`) et « Hypothèses » (`BacktestAssumptions`) avec un résultat, puis « Historique d'exécution » (`ExecutionList`), déplié quand il n'y a pas de résultat. Chaque en-tête montre un résumé et « Afficher » / « Masquer ».
- **Props** :
  - `backtest` : `result` (peut être null) et `executions`.
- **Source** : `src/features/backtest/result/result-details.tsx`.

### BacktestAssumptions

- **Import** : `import { BacktestAssumptions } from "@/features/backtest/result/assumptions"`.
- **Rôle** : liste « Hypothèses » d'un résultat, sans carte, en deux colonnes à partir de `sm` : période, devise (`BACKTEST_CURRENCY`), frais par ordre (achat et vente, D8), rebalancement (`rebalanceFrequencyLabels`), benchmark (`backtest.benchmarkSymbol`, `NO_BENCHMARK_LABEL` si null), taux sans risque du Sharpe (`result.riskFreeRate`, publié par l'engine), règle d'exécution, source et type de cours, date de récupération et empreinte des données (12 premiers caractères, valeur complète en `title`), puis `BACKTEST_DISCLAIMER`. `<Dash />` si `riskFreeRate`, `executionRule` ou `dataSource` est `null` (résultat antérieur). Libellés des données calculées ou des paramètres qui changent le calcul (frais, rebalancement, benchmark, taux sans risque, règle d’exécution, source, empreinte) en `InfoHint`.
- **Props** :
  - `backtest` : `startDate`, `endDate`, `feeRate` (fraction par ordre), `rebalanceFrequency` affichés.
  - `result` : `executionRule` et `dataSource` affichés.
- **Source** : `src/features/backtest/result/assumptions.tsx`.

### ExecutionList

- **Import** : `import { ExecutionList } from "@/features/backtest/result/execution-history"`.
- **Rôle** : lignes d'exécution, sans carte : tentative, statut, date, résumé ou cause d'échec, durée ; barre de progression pour une exécution active.
- **Props** :
  - `executions` : Plus récente d'abord.
- **Source** : `src/features/backtest/result/execution-history.tsx`.

### BacktestStats

- **Import** : `import { BacktestStats } from "@/features/backtest/stats"`.
- **Rôle** : 4 `StatCard` de la liste : total, en cours, terminés et échoués (avec taux `formatRate`), valeurs de `GET /api/backtest/stats` affichées telles quelles ; `Dash` pendant le chargement.
- **Props** :
  - `stats` : `useBacktestStats().data` ; `undefined` pendant le chargement.
- **Source** : `src/features/backtest/stats.tsx`.

### ResultMetrics

- **Import** : `import { ResultMetrics } from "@/features/backtest/result/result-metrics"`.
- **Rôle** : 3 `MetricBlock` d'un résultat, sur 2 colonnes à partir de `md` et 3 à partir de `xl` : « Performance » (CAGR, rendement total, valeur finale ; note : investissement unique et écart `dcaAdvantage` en DCA), « Risque » (volatilité, Sharpe avec `result.riskFreeRate` en description, max drawdown, récupération `formatRecovery` ; note : date du plus haut), « Coûts et activité » (frais payés, déduits de la valeur sur achats et ventes, ordres, rebalancements `rebalanceCount`). Avec `result.benchmark`, une colonne au symbole du benchmark affiche ses métriques. Tout est calculé par le moteur ; `<Dash />` si un champ manque (résultat antérieur).
- **Props** :
  - `result` : Résultat complet (ratios en fraction, montants en string).
  - `rebalanceFrequency` : Description du bloc « Coûts et activité ».
- **Source** : `src/features/backtest/result/result-metrics.tsx` (`PerformanceBlock` interne ; `RiskBlock` et `CostsBlock` dans `result/result-blocks.tsx`). Valeurs des lignes : [`features/backtest/metrics.tsx`](#featuresbacktestmetricstsx).

### `features/backtest/metrics.tsx`

- **Import** : `import { metricDefinitions, resultValue, benchmarkValue } from "@/features/backtest/metrics"`. Les fonctions de valeur prennent les `Formatters` de `useFormatters()` en premier argument.
- Une métrique = un libellé, une entrée du glossaire et un format, définis une fois pour le détail et la comparaison. Ajouter une métrique affichée : sa ligne ici, puis sa clé dans la liste des lignes de l'écran.

| Export | Rôle |
| --- | --- |
| `Metric` | Métriques d'un résultat et de son benchmark. |
| `metricDefinitions` | Aide et format de chaque métrique (libellé `backtest.metrics.<métrique>`) : CAGR, rendement total et max drawdown en `formatRatio`, volatilité en `formatPercent`, Sharpe en `formatSharpe`, valeur finale en `formatAmount`. |
| `resultValue(f, result, metric)` | Métrique d'un résultat (Decimal sérialisé), formatée ; `<Dash />` si absente (résultat antérieur). |
| `withBenchmark` | `withBenchmark(cells, benchmark, benchmarkCell)` : `cells`, suivies avec un benchmark de `benchmarkCell(benchmark)` (colonnes et valeurs d'un tableau d'indicateurs). |
| `benchmarkValue(f, benchmark, metric)` | Métrique d'un benchmark (nombre du moteur), formatée ; `<Dash />` si `null`. |
| `metricHead(t, metric)`, `recoveryHead(t)` | Libellé traduit et aide d'une ligne de métrique, de la ligne « Récupération ». |
| `resultColumns(t, result)`, `metricRow(f, t, result, metric, details?)`, `recoveryRow(f, t, result)` | Colonnes (portefeuille, benchmark) et lignes d'un bloc d'indicateurs. |
| `resultRecovery(f, t, result)`, `benchmarkRecovery(f, t, benchmark)` | Récupération via `formatRecovery` ; `<Dash />` pour un résultat antérieur au calcul. |

Source : `src/features/backtest/metrics.tsx`.

### BacktestCompare

- **Import** : `import { BacktestCompare } from "@/features/backtest/comparison/backtest-compare"`.
- **Rôle** : écran comparaison (maquette 19 v2) : en-tête et « Copier le lien », `ComparisonSelection`, puis, avec deux backtests choisis, bandeau « Comparaison non homogène » si `homogeneous` est faux (une phrase par élément de `differences`), `ComparisonOverview`, `ComparisonMetrics` et `ComparisonParameters` (côte à côte à partir de `xl`). La sélection vit dans l'URL : `?ids=a,b` (`router.replace`), lien partageable ; un lien modifié à la main (`?ids=x,x`, plus de deux ids) est traité comme sans sélection, avec un message. Instancie `useBacktestComparison`.
- **Props** :
  - `ids` : Valeur brute du paramètre `ids` de l'URL : ids de A et B séparés par une virgule, un côté vide si non choisi.
- **Source** : `src/features/backtest/comparison/backtest-compare.tsx`.

### ComparisonSelection

- **Import** : `import { ComparisonSelection } from "@/features/backtest/comparison/comparison-selection"`.
- **Rôle** : carte de choix des backtests A et B parmi les `COMPARABLE_LIMIT` plus récents qui ont un résultat terminé, même relancés depuis (`useBacktests` avec `hasResult`), bouton « Échanger ». Un backtest choisi d'un côté n'est pas proposé de l'autre.
- **Props** :
  - `a` : Id de A, `""` si non choisi.
  - `b` : Id de B, `""` si non choisi.
  - `onChange` : Nouvelle paire (choix ou échange).
- **Source** : `src/features/backtest/comparison/comparison-selection.tsx`.

### ComparisonOverview

- **Import** : `import { ComparisonOverview } from "@/features/backtest/comparison/comparison-overview"`.
- **Rôle** : carte « Valeur des portefeuilles » : légende, valeurs de A et B (`comparisonSideColors`) et benchmark de A, sinon de B (`getComparisonBenchmark`), en pointillés (courbes alignées par `alignCurves`), puis drawdowns de A et B sur le même axe, via `ValueDrawdownCharts` ; drawdown masqué si aucun point n'en porte.
- **Props** :
  - `comparison` : Réponse de `GET /api/backtest/compare`.
- **Source** : `src/features/backtest/comparison/comparison-overview.tsx`.

### ComparisonMetrics, ComparisonParameters

- **Import** : `import { ComparisonMetrics } from "@/features/backtest/comparison/comparison-metrics"`, `import { ComparisonParameters } from "@/features/backtest/comparison/comparison-parameters"`.
- **Rôle** : deux `MetricBlock`. `ComparisonMetrics` : « Métriques comparées » (CAGR, rendement total, volatilité, Sharpe, max drawdown, récupération, valeur finale) en colonnes A, B, « Écart » (`deltas` de l'API, en points de ratio « ±x,x pts », Sharpe sans unité ; vert si favorable à A selon `comparedMetricHigherIsBetter`, rouge sinon ; `<Dash />` sans écart) et, si A (sinon B) a un benchmark (`getComparisonBenchmark`), son symbole. `ComparisonParameters` : « Paramètres » (période, mode, allocation, rebalancement, frais, benchmark) de A et B, badge « diffère » sur ceux de `differences`.
- **Props** (les deux) :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `comparison` | `BacktestComparison` | oui | — | Réponse de `GET /api/backtest/compare`. |

- **Source** : `src/features/backtest/comparison/comparison-metrics.tsx` (lignes construites depuis `metricHead`, écart coloré par `Delta`), `src/features/backtest/comparison/comparison-parameters.tsx`.

### `features/backtest/batch/backtest-batch.tsx`

- **Import** : `import { BacktestBatchView } from "@/features/backtest/batch/backtest-batch"`. Props : `batchId`. Page d'un lot de départs (maquette 32, `/app/backtest/batch/[batchId]`) : en-tête avec « Modifier les départs » et « Relancer le lot », `BatchStats`, tableau des résultats par date de départ, carte « Dates de départ » (`StartDates`, « Lancer le lot (N départs) » crée un nouveau lot) et `RollingWindows`. Valeurs telles que reçues de l'API.
- Sous-composants : `batch/batch-stats.tsx` (`BatchStats({ batch })` : quatre cartes de synthèse), `batch/rolling-windows.tsx` (`RollingWindows({ windows })` : onglets 1/3/5 ans, tableau, courbe du rendement annualisé avec la pire fenêtre marquée), `form/start-dates.tsx` (`StartDates({ dates, onChange, end, action? })` : Départ 1 à 10, refus sous le champ fautif, « Ajouter une date », compteur « n / 10 dates » ; aussi utilisé sous l'interrupteur du formulaire « Nouveau backtest »).

### `features/backtest/api.ts`

- **Import** : `import { getBacktest } from "@/features/backtest/api"`. Appeler via les hooks plutôt que directement.

| Export | Route (`apps/core-backend/API.md`) |
| --- | --- |
| `createBacktest` | `POST /api/backtest` |
| `createBacktestBatch` | `POST /api/backtest/batch` (`startDates` = `start` + `extraStartDates`) |
| `getBacktestBatch` | `GET /api/backtest/batch/:batchId` |
| `restartBacktestBatch` | `POST /api/backtest/batch/:batchId/starts` (`startDates`) |
| `rerunBacktestBatch` | `POST /api/backtest/batch/:batchId/executions` |
| `previewBacktest` | `POST /api/backtest/preview` |
| `getBacktests` | `GET /api/backtest?page&pageSize&status&hasResult` (`status` = statuts séparés par des virgules, omis si vide ; `hasResult=true` si vrai) |
| `getBacktestStats` | `GET /api/backtest/stats` |
| `getBacktest` | `GET /api/backtest/:id` |
| `compareBacktests` | `GET /api/backtest/compare?ids=a,b` |
| `rerunBacktest` | `POST /api/backtest/:id/executions` |

Source : `src/features/backtest/api.ts`.

### `features/backtest/hook.ts`

- **Import** : `import { useBacktest } from "@/features/backtest/hook"`.

| Export | Clé / comportement |
| --- | --- |
| `useCreateBacktest` | Invalide `["backtest", "list"]` et `["backtest", "stats"]` au succès. |
| `useCreateBacktestBatch` | Invalide `["backtest", "list"]` et `["backtest", "stats"]` au succès. |
| `useRestartBacktestBatch` | Invalide `["backtest"]` au succès ; l'écran passe au nouveau lot. |
| `useRerunBacktestBatch` | Invalide `["backtest"]` au succès. |
| `useBacktestBatch` | `["backtest", "batch", batchId]` ; rafraîchi toutes les 2 s tant qu'un départ est actif. |
| `useBacktestPreview` | `["backtest", "preview", values]` ; désactivé si `values` est `null` (formulaire invalide) ; réponse précédente gardée pendant le recalcul (`keepPreviousData`). |
| `useBacktests` | `["backtest", "list", params]` ; page précédente gardée pendant le chargement (`keepPreviousData`). |
| `useBacktestStats` | `["backtest", "stats"]`. |
| `useBacktest` | `["backtest", "detail", id]` ; rafraîchi toutes les 2 s tant que la dernière exécution est dans `activeStatuses`. |
| `useBacktestComparison` | `["backtest", "compare", a, b]` ; désactivé sans deux ids distincts. |
| `useRerunBacktest` | Invalide `["backtest"]` au succès (liste, stats et détail). |

Source : `src/features/backtest/hook.ts`.

### `features/backtest/schema.ts`

- **Import** : `import { createBacktestFormSchema, type BacktestValues } from "@/features/backtest/schema"`.

| Export | Rôle (et unité) |
| --- | --- |
| `createBacktestFormSchema(t)` | `t` = `useTranslations("backtest")` : messages dans la langue active. Formulaire complet, miroir de `createBacktestSchema` du backend. `weight` en **pourcent entier** (`NaN` rejeté) ; montants en devise de saisie ; `fee` en **pourcentage** par ordre. Body de `POST /api/backtest`. |
| `BacktestValues` | Type des valeurs. `multipleStarts` + `extraStartDates` (`{ date }[]`, vidé hors lot) : lot de départs, `start` est le Départ 1, 2 à 10 dates distinctes au total, chacune au moins un an avant `end`. |
| `createQuickBacktestFormSchema(t)` | Même `t`. Test rapide : `name` et `allocations` (100 % sur le symbole) ajoutés par `QuickBacktestForm`. |
| `QuickBacktestValues` | Type des valeurs. |

Source : `src/features/backtest/schema.ts`.

### `features/backtest/constants.ts`

- **Import** : `import { statusVariants } from "@/features/backtest/constants"`.

| Export | Rôle |
| --- | --- |
| `BACKTEST_CURRENCY` | Devise d'affichage des montants (cours non convertis). |
| `activeStatuses` | Statuts d'une exécution qui peut encore évoluer (miroir de `ACTIVE_STATUSES` backend). |
| `investmentModes` | Modes d'investissement du `SelectField` ; libellés `backtest.investmentMode.<mode>`. |
| `rebalanceFrequencies` | Fréquences de rebalancement (select et backtest stocké) ; libellés `backtest.rebalanceFrequency.<fréquence>`. |
| `DEFAULT_INVESTMENT_MODE`, `DEFAULT_INITIAL_AMOUNT`, `DEFAULT_FEE_PERCENT` | Valeurs initiales du formulaire et du test rapide : `LUMP_SUM`, 10 000 en `BACKTEST_CURRENCY`, 0,1 % par ordre. |
| `DEFAULT_REBALANCE_FREQUENCY` | Fréquence par défaut du formulaire complet et du test rapide (même défaut que le schéma du backend). |
| `DEFAULT_BENCHMARK_SYMBOL` | Benchmark proposé par le formulaire complet (D9), retirable. |
| `dataProviderLabels` | Nom du fournisseur de cours (nom propre, non traduit). Les autres libellés du domaine (stratégie, règle d'exécution, type de cours, avertissement, benchmark absent, titres de comparaison) sont dans `messages/*.json`, namespace `backtest`. |
| `previewSteps` | Clés des étapes affichées par le récapitulatif ; textes `backtest.preview.steps.<étape>`. |
| `statusVariants` | Variante du badge de chaque statut d'exécution (libellé `backtest.status.<statut>`). |
| `tradeSideVariants` | Variante du badge du côté d'un ordre (libellé `backtest.tradeSide.<côté>`) ; `side` absent (résultat antérieur) lu comme `BUY` (D10). |
| `statusFilters` | Onglets de filtre de la liste (libellés `backtest.filters.<filtre>`) ; `statuses` envoyés en `status` à `getBacktests` (`all` = vide, aucun filtre). |
| `StatusFilter` | Type de l'onglet actif. |
| `COMPARABLE_LIMIT` | Nombre de backtests proposés au choix de la comparaison (`MAX_PAGE_SIZE` du contrat, `pageSize` maximal de `GET /api/backtest`). |
| `comparisonSideColors` |2)", className: "bg-chart-1|2" }` | Couleur de A et B : courbes, légende, pastilles de sélection. |
| `comparedMetricHigherIsBetter` | Sens favorable d'un écart A − B, pour sa couleur (affichage seulement). |

Source : `src/features/backtest/constants.ts`.

### `features/backtest/utils.ts`

- **Import** : `import { getExecution } from "@/features/backtest/utils"`.

| Export | Rôle |
| --- | --- |
| `getExecution` | Dernière exécution (`executions[0]`). |
| `hasStatus` | Statut de la dernière exécution dans la liste. |
| `isActive` | Exécution `PENDING` ou `RUNNING`. |
| `getExecutionDuration(t, e)` | Durée `finishedAt − (startedAt ?? createdAt)`, « 2 min 5 s » ou « 12 s » (minimum 1 s) ; `null` si non terminée. |
| `fromDecimal` | `Decimal` sérialisé → `number`, `null` ou absent → `null`. |
| `formatAllocation(f, allocations)` | Allocation lisible : « AAPL 60 % · MSFT 40 % » (`formatRate` du poids). |
| `alignCurves` | Courbes de A et B sur l'union de leurs dates triées : séries `a` et `b` (absentes hors de leur période) et, avec `benchmarkSide`, `benchmark` = `benchmarkValue` de ce côté ; `value` choisit la série (valeur, drawdown). |
| `formatAmount(f, v)` | Montant en `BACKTEST_CURRENCY`, au format de la langue active. |
| `formatRecovery(f, t, …)` | Durée `formatDuration` ; si `recoveryDays` est null : « Aucune baisse » sans baisse, « Non récupéré » si `peakDated` (`maxDrawdownPeakDate` non null ; `true` pour un benchmark), sinon `null`, affiché `<Dash />` par l'écran (résultat antérieur, que l'API renvoie aussi à null). |
| `benchmarkLabel(t, symbol)` | Nom de la série du benchmark : « Benchmark URTH ». |
| `BacktestTranslator` | Type du traducteur `useTranslations("backtest")`, passé aux helpers qui produisent du texte (`getExecutionDuration`, `formatRecovery`, `benchmarkLabel`). |
| `comparisonLabel` | « A · 60/40 » : colonnes, légende et infobulles de la comparaison. |
| `getComparisonBenchmark` | Benchmark affiché : celui de A, sinon celui de B ; `benchmark` null si aucun. |

Source : `src/features/backtest/utils.ts`. Helpers purs : aucun JSX (`<Dash />` est ajouté par l'écran).

### `features/backtest/column.tsx`

- **Import** : `useBacktestColumns` de `@/features/backtest/column` ; `useTradeColumns` de `@/features/backtest/result/trades-columns` ; `useDividendColumns` de `.../result/dividends-columns` ; `useHoldingColumns` de `.../result/holdings-columns` ; `useBatchColumns` de `.../batch/batch-columns` ; `useRollingColumns` de `.../batch/rolling-columns`. Hooks (formats de la langue active) : à appeler dans le composant, puis `columns={columns}`.

| Export | Type | Colonnes |
| --- | --- | --- |
| `useBacktestColumns()` | `Column<Backtest>[]` | Nom, Stratégie, Allocation (`formatAllocation`, tronquée, texte complet en `title`), Période, Rendement (`totalReturn` × 100 via `ChangeCell`), CAGR (`cagr` du résumé × 100 via `ChangeCell`, `<Dash />` si non terminé ou résultat antérieur), Statut (badge), Durée. En-têtes Rendement, CAGR et Durée en `InfoHint`. |
| `useBatchColumns(endDate)` | `Column<BacktestBatch["rows"][number]>[]` | Départ, Durée (jusqu'à `endDate`), CAGR, Volatilité, Drawdown max, Valeur finale, Statut (« Meilleur » / « Pire » une fois le lot terminé) ; `<Dash />` sans résultat. |
| `useRollingColumns()` | `Column<RollingWindow>[]` | Durée (1, 3, 5 ans), Pire, Médiane, Meilleure, Part négative (rendements annualisés). |
| `useTradeColumns()` | `Column<Trade>[]` | Date, Symbole (`SymbolCell`), Côté (badge `tradeSideVariants`, « Achat » si `side` absent), Prix (2 décimales, sans devise), Quantité (jusqu'à 6 décimales), Montant et Frais (`formatPrice` en `BACKTEST_CURRENCY`) ; `Dash` si absents (résultats antérieurs). En-têtes Côté, Prix, Quantité, Montant, Frais en `InfoHint`. |
| `useDividendColumns()` | `Column<DividendEvent>[]` | Date ex-dividende, Symbole (`SymbolCell`), Montant et Quantité (`formatPrice` en `BACKTEST_CURRENCY`, jusqu'à 6 décimales). En-têtes Montant et Quantité en `InfoHint`. |
| `useHoldingColumns()` | `Column<Holding>[]` | Symbole (`SymbolCell`), Quantité (jusqu'à 6 décimales), Valeur au dernier cours (`formatPrice` en `BACKTEST_CURRENCY`). En-têtes Quantité et Valeur en `InfoHint`. |

Source : `src/features/backtest/column.tsx` (liste), `result/*-columns.tsx` (ordres, dividendes, positions), `batch/*-columns.tsx` (lot, fenêtres glissantes).

### `features/backtest/types.ts`

- **Import** : `import type { Backtest, BacktestDetails, BacktestResult } from "@/features/backtest/types"`.
- Réponses de core-backend : `Decimal` → `string` (ratios en fraction), dates → `string` ISO. Les données du moteur et des contrats (`EquityPoint`, `Trade`, `Holding`, `Benchmark`, `LumpSumComparison`, `ExecutionRule`, `DataSource`, `BacktestPreview`, `BacktestComparison`…) sont **dérivées de `@trading-plateform/contracts`** (`import type`), unités dans `packages/contracts/src/backtest.ts`. Champs absents des résultats antérieurs : optionnels ou `null`, affichés `<Dash />`. Le détail de chaque type et de ses unités est en commentaire dans le fichier.
- Types propres au web : `Backtest` (liste), `BacktestDetails` (détail, `result` = dernier résultat terminé), `BacktestExecution`, `BacktestResult`, `AllocationInput` (saisie, poids en pourcent entier), `ExecutionStatus`, `InvestmentMode`, `RebalanceFrequency`, `BacktestListStats`.

Source : `src/features/backtest/types.ts`.
