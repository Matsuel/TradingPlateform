# Audit `apps/web` — 2026-11-01

Branche `refactor/web-audit`. Deux passes : conformité aux conventions (Next.js 16, règles du dépôt), puis taille et complexité des fichiers et des composants.

## 1. Corrections appliquées

Contrôles après le dernier commit : `tsc`, `lint`, `format:check` et `next build` passent. Le build liste `ƒ Proxy (Middleware)`, absent avant. Une requête sur `/app/...` sans cookie renvoie un `307` vers `/login?redirect=…`.

| Commit | Contenu |
| --- | --- |
| `6dfea18` | **Biome** installé : formatage et tri des imports (4 espaces, guillemets doubles, sans `;`, 120 colonnes). `components/ui/` et le Markdown sont exclus. ESLint garde les règles Next et React. Scripts `format` et `format:check`. |
| `c06774a` | **Navigation et shell** : `proxy.ts` déplacé dans `src/` (à la racine, Next l'ignorait), `lib/routes.ts` (seule source des URL), `lib/navigation.ts` (`findActiveTab`), `lib/env.ts` (env validé par zod, `baseURL` de better-auth lu depuis l'env). Sidebar en `Link` avec infobulles en mode replié. Layouts en `lang="fr"`, gabarit de titre « %s · MarketFlow », un seul `<main>`, `error.tsx`. Fichiers en kebab-case, exports nommés. |
| `6cd2b40` | Formatage Biome de `src/`. Conventions écrites dans `apps/web/AGENTS.md` et `AGENTS.md`. Le skill `verify` lance `format:check`. |
| `97108f3` | **Doublons retirés** : token CSS `--success` à la place du vert codé en dur, `OptionSelect` partagé par `SelectField` et la sélection de la comparaison, `SymbolPicker` qui réutilise `useDebouncedValue` et `SymbolCell`, périodes du graphique de prix via `FilterTabs`, `features/backtest/utils.ts` sans JSX (`orDash` dans `components/dash.tsx`, `formatRecovery` renvoie `null`). |
| `8035b1d` | Onglets du marché non branchés retirés. Le bouton « Tester » ouvre directement le test rapide (le trading est un bonus, non construit). Le test rapide affiche les erreurs 400 sous les champs et ne laisse plus de rejet non géré. |
| `25f9264` | README propre au projet, nettoyage de `next.config.ts`, `skipToken` à la place de `values!` dans `useBacktestPreview`. |

### Sidebar

Ordre de la roadmap. Les pages non construites n'affichent que leur titre et leur description (`PageHeader`).

| Section | Onglets |
| --- | --- |
| Vue d'ensemble | Dashboard, Notifications |
| Marché | Marché |
| Strategy Lab | Backtests, Nouveau backtest, Comparaison, Paper trading |
| Analyse | Risque, Projection, Optimisation, Rapports |
| Administration (admin) | Monitoring, Utilisateurs, Données de référence |

Les entrées Portefeuille et Ordres sont retirées : le marché simulé est un bonus.

### Changements de comportement

- Le proxy ne protège plus que `/app`. Un utilisateur connecté qui ouvre `/login` est renvoyé vers le dashboard par le layout `(auth)`, côté serveur. Sans cela, un cookie expiré ferait boucler les deux redirections (`/login` → `/app` → `/login`).
- Après connexion, l'utilisateur revient à la page demandée (`safeRedirect` refuse toute URL hors de `/app`).

### Avertissements de `verify` gardés

- `env` déclaré aussi dans les autres apps : c'est la convention, chaque app a son `env.ts`.
- `Trade` déclaré aussi dans les contrats : le type web en est déjà dérivé (`Pick`).

### Écarts aux maquettes

Retouches demandées : nouvelle sidebar, onglets du marché retirés, onglet « Trade » retiré du panneau du symbole.

**Non comparé au Figma** : l'app n'a pas été lancée avec un backend, et aucune capture n'a été faite.

## 2. Taille et complexité

Mesure hors `components/ui/` et `constants/glossary.ts` : 5 148 lignes. Les plus gros fichiers font entre 140 et 203 lignes ; 10 composants dépassent 70 lignes.

| # | Où | Constat | Correction proposée |
| --- | --- | --- | --- |
| C1 | `features/backtest/stats.tsx` `BacktestResultBlocks` (131 l.), `features/backtest/comparison-blocks.tsx` `ComparisonMetrics` (102 l.) | La même table « métrique → libellé, aide, format » est écrite deux fois : CAGR → `formatRatio`, volatilité → `formatPercent`, etc. Chaque ligne de métrique fait 8 lignes de JSX. | Une table `metricDefinitions` dans `features/backtest/metrics.tsx`, avec `resultValue(r, m)` et `benchmarkValue(b, m)`. Les lignes deviennent un `map` sur une liste de clés. Découper en `PerformanceBlock`, `RiskBlock` et `CostsBlock`, déplacés dans `result-metrics.tsx` (`stats.tsx` est réservé aux `StatCard`). Gain estimé à l'époque : environ −120 lignes ; non obtenu (voir section 3, « Résultat »). |
| C2 | `features/backtest/result-overview.tsx` (104 l.), `features/backtest/comparison-overview.tsx` (70 l.) | La même paire de graphiques est dupliquée : valeur en `h-56` avec `hideXAxis`, puis libellé « Drawdown » et courbe de drawdown en `h-24` avec `formatRate` et `formatRatio`. | Composant `ValueDrawdownCharts`. Sortir aussi l'en-tête « Valeur finale / plus-value » dans `ResultHeadline`. |
| C3 | `components/chart.tsx` `PriceAreaChart` (15 props, 105 l.) | Trois `<Area>` presque identiques, deux modes de couleur, et un nom « Price » alors que le composant trace aussi un drawdown. | Une liste de séries `{ key, label, color, dashed }` rendue par un `map`, et un nom neutre (`AreaSeriesChart`). Il ne reste que 3 appelants une fois C2 fait. |
| C4 | `components/form/fields/allocation-field.tsx` (111 l., 13 niveaux d'indentation) | Le rendu d'une ligne est écrit directement dans le render-prop. | Composant `AllocationRow`. Déplacer `allocationTotal` et `FULL_PERCENT` (règle de domaine) dans `features/backtest`. |
| C5 | `components/symbol-picker.tsx` (98 l.) | Quatre blocs conditionnels répètent `!tooShort && !isSearching && !error…`. | Calculer un état unique (`"tooShort" \| "searching" \| "error" \| "empty" \| "results"`), puis un seul `switch` d'affichage. |
| C6 | `features/backtest/backtest-detail.tsx` (composant de 83 l., fichier de 144 l.) | L'état de la table des ordres (`allTrades`, `tradePage`, découpage) vit dans l'écran. | Section `trades-table.tsx` ; l'écran garde la composition et la mutation de relance. |
| C7 | `components/data-table/data-table.tsx` (191 l.) | `TablePagination` (60 l.) partage le fichier de `DataTable`. | Fichier `data-table/table-pagination.tsx`. |
| C8 | `apps/web/COMPONENTS.md` (1 500 l.) | Les colonnes « Utilisé par » sont à retoucher à chaque refacto (constaté sur chaque lot de ce chantier). Les tableaux de props recopient les types. | Retirer « Utilisé par » (un `grep` le donne) et garder rôle, exemple et props non évidentes. Environ −40 %. |
| C9 | Règle manquante | Aucun seuil de taille n'est écrit. | Ajouter dans `apps/web/AGENTS.md` : fichier ≤ 150 lignes, composant ≤ 60 lignes, ≤ 8 props. Ajouter dans `verify` un avertissement sur un `.tsx` de plus de 150 lignes. |

## 3. Taille et complexité : corrections appliquées

Tous les points C1 à C9 sont appliqués. Après chaque commit : `tsc`, `lint` et `format:check` passent (`verify`). `next build` passe à la fin.

| Commit | Points | Contenu |
| --- | --- | --- |
| `9765337` | C1 | `features/backtest/metrics.tsx` : libellé, aide et format de chaque métrique, définis une fois. `ResultMetrics` (`result-metrics.tsx`) découpé en `PerformanceBlock`, `RiskBlock` et `CostsBlock`. `stats.tsx` ne garde que les `StatCard`. |
| `e173b07` | C2, C3 | `AreaSeriesChart`, piloté par une liste de séries, remplace `PriceAreaChart` (15 props, trois `Area` écrites à la main). `ValueDrawdownCharts` est partagé par le détail et la comparaison. `ResultOverview` est découpé en `ResultHeadline` et `ProfitLine`. |
| `f446f81` | C4 | `AllocationField` déplacé dans `features/backtest` (seul domaine utilisateur), avec `AllocationRow`. `FULL_PERCENT`, `allocationTotal` et `AllocationInput` rejoignent `constants`, `utils` et `types`. |
| `24ab3bb` | C5 | `SymbolPicker` s'affiche depuis un état unique (`searchState`). |
| `5d44229` | C6 | `TradesTable` extrait de `BacktestDetail`. `StatusBadge` remplace trois badges de statut écrits à la main. |
| `ab9f65c` | C7 | `TablePagination` dans `data-table/table-pagination.tsx`. |
| `a07b133` | C8 | `COMPONENTS.md` : colonnes et lignes « Utilisé par » supprimées, ainsi que la colonne « Signature » des tableaux de modules. Résultat : 100 761 → 81 297 caractères dans ce commit (−15 % depuis `develop`, à 96 424). Suite en section 4 (`b8c22c3`). |
| `d7007d7` | C9 | Seuils écrits dans `apps/web/AGENTS.md` (« Taille et complexité »). `verify` avertit sur un fichier web de plus de 150 lignes. `comparison-blocks.tsx` (164 l.) scindé en `comparison-metrics.tsx` et `comparison-parameters.tsx`. |

### Résultat

- Plus gros fichier : 142 lignes (`components/symbol-picker.tsx`), contre 203 avant. Aucun fichier ne dépasse 150 lignes.
- Total : 5 179 lignes, stable. Le gain est dans la forme : plus de doublons de métriques ni de graphiques, des composants plus courts.
- Écart à la maquette : aucun voulu. La mise en page du détail (plus-value et légende sur une ligne) est conservée. **Non comparé au Figma** : l'app n'a pas été lancée avec un backend.

### Reste au-delà de 60 lignes

Traité en section 4 : plus aucun composant au-delà de 60 lignes.

## 4. Revue de code et corrections

Revue `/code-review` de `develop...HEAD` sur deux axes (standards du dépôt, conformité à cet audit). Tous les points relevés sont corrigés, sauf C8 (voir ci-dessous et section 5). Après chaque commit : `tsc`, `lint` et `format:check` passent (`verify`).

| Commit | Point de la revue | Correction |
| --- | --- | --- |
| `c9c46b8` | `MetricBlock` à 9 props ; `strong` trompeur ; aide des colonnes indexée par le texte de l'en-tête ; « Récupération » écrit deux fois ; C1 sans `map` | `MetricColumn { label, hint }` remplace `columnHints` ; `strong` devient `boldColumns` ; `className` (jamais passé) retiré : 7 props. `MetricBlockRow` extrait. `recoveryDefinition` dans `metrics.tsx`. Les blocs du résultat font un `map` sur leurs listes de métriques. |
| `61883c8` | Deux légendes, série du benchmark écrite deux fois, couleur de tendance répétée | `ChartLegend` construit la légende depuis les `ChartSeries` (couleur, pointillés, aide). `referenceSeries` et `benchmarkLabel` sont partagés. Les traits de légende prennent la couleur de la série. |
| `76695dd` | `QuickBacktestForm` à 80 lignes ; `"—"` en dur ; `catch` `apiIssues` copié ; libellés « (€) » et valeurs initiales en double | `InvestmentModeFields` et `PeriodAndCapitalFields` sont partagés par les deux formulaires (aide `feeRate` aussi dans le test rapide). `setFormIssues` remplace la boucle copiée. `DEFAULT_INVESTMENT_MODE`, `DEFAULT_INITIAL_AMOUNT`, `DEFAULT_FEE_PERCENT` et `currencySymbol` remplacent les littéraux. `QuickTestSummary` et `QuickTestActions` sont extraits ; `<Dash />` remplace le tiret écrit en dur. |
| `aa55809` | 5 composants au-delà de 60 lignes ; `DataTable` à 11 props ; C5 sans `switch` | `DataTable` : le cadre et le titre passent dans `TableCard` ; `loader` et `className`, jamais passés, sont retirés ; `StatusRow` et `DataRows` sont extraits. `AreaSeriesChart` : infobulle dans `tooltipContent`. `SymbolPicker` : `searchState` et `SearchResults` (un `switch`) dans `symbol-search-results.tsx`. `AppField` : `FieldLayout`. `AllocationField` : `AllocationFooter`. |
| `fe9652d` | C9 : seuils fonction et props non contrôlés | `verify` avertit aussi sur une fonction de plus de 60 lignes et sur un `…Props` de plus de 8 champs ; contrôle testé sur un fichier sonde. |
| `b8c22c3` | C8 : −40 % visé, −19 % obtenu | Entrées des features : props en liste et sans exemple ; entrée `types.ts` résumée. `COMPONENTS.md` : 96 424 → 67 641 caractères depuis `develop` (−30 %). Les composants partagés gardent leurs tableaux de props et leurs exemples. |

### Résultat

- Aucun fichier au-delà de 150 lignes (le plus gros : `features/backtest/allocation-field.tsx`, 146). Aucune fonction au-delà de 60 lignes, aucun composant au-delà de 8 props : `verify` ne signale rien.
- Total : 5 323 lignes (+144 depuis la section 3). La hausse vient des sous-composants nommés et de leur JSDoc.
- Écarts visuels mineurs : dans le test rapide, le versement mensuel apparaît désormais juste sous le mode, comme dans le formulaire complet, et le champ des frais a son aide. Les traits de légende de la comparaison passent de 3 px à 2 px, comme ceux du résultat. **Non comparé au Figma.**

## 5. Règle « shadcn d'abord » et 3ᵉ revue

Demande : « prioriser l'utilisation de composants shadcn quitte à développer de nouveaux variants, règle stricte ». La règle est écrite dans `apps/web/AGENTS.md` (« shadcn d'abord (règle stricte) », commit `271647d`). La 3ᵉ revue (PR #6) a relevé les écarts du code existant à cette règle, et quelques code smells restants. Tout est corrigé ci-dessous. Après chaque commit : `tsc`, `lint` et `format:check` passent (`verify`).

| Commit | Correction |
| --- | --- |
| `8208c06` | `shadcn add progress empty`. Variants ajoutés : `Badge` `size="lg"`, `Button` `variant="hint"` et `size="inline"`, `Card` `size="compact"`, `Table` (`TableRow` `static`/`plain`, `TableHead` `caption`/`row`, `TableCell` `strong`/`muted`), `Progress` (`size`, `variant`). Les éléments bruts deviennent `Button`, `Label` et `Table`. Les barres faites main deviennent `Progress`. Les erreurs de formulaire passent par `FieldError`, les états vides par `EmptyCard`. Les classes de style posées sur des composants `ui/` deviennent des variants. |
| `c10a2cf` | `DetailRow` remplace trois copies de la ligne libellé / valeur. `lib/trend.ts` (`trendOf`, `trendStyles`) fixe une seule règle de couleur pour une variation. `withBenchmark` construit une fois les colonnes et les cellules du benchmark, et `recoveryRow` se construit comme `metricRow`. `setFormIssues` passe dans `components/form`. `useWatch` est typé dans les champs partagés. La légende de la comparaison a l'aide `benchmark`. Typographie : les tokens du thème remplacent `text-sm` et `text-xs`, et la règle est écrite. |
| `d2312d8` | Exemples des composants partagés restaurés : la compaction `b8c22c3` les avait retirés à tort ; les exemples périmés sont mis à jour. La règle shadcn nomme aussi `<input>`, `<textarea>` et les barres de progression en `<div>`. `verify` compte aussi les props typées en ligne et décrit son heuristique. |

### Résultat

- Aucun élément HTML brut à la place d'une primitive hors `components/ui/` (`grep` de `<table>`, `<button>`, `<label>`, `<select>`, `<input>`, `<textarea>` : 0).
- Plus gros fichier : 148 lignes (`features/backtest/allocation-field.tsx`). Plus longue fonction : 58 lignes (`BacktestPreviewSummary`). Total : 5 356 lignes. `verify` ne signale aucun dépassement.
- **C8 reste partiel** : `COMPONENTS.md` fait 75 321 octets contre 96 424 sur `develop` (−22 %). L'objectif était −40 %. Le catalogue décrit maintenant une quinzaine d'exports de plus (`TableCard`, `EmptyCard`, `DetailRow`, `ChartLegend`, `lib/trend.ts`, variants `ui/`…), et les composants partagés gardent leurs exemples.
- **Écarts visuels mineurs** :
  - le titre des cartes de données passe en `CardTitle` taille `compact` ;
  - les états vides passent par `Empty` ;
  - `StatCard` perd son `shadow-xs` ;
  - une variation nulle n'est plus verte mais neutre (texte, badge, courbe) ;
  - le bouton de retrait d'un symbole devient un `Button` `icon-xs` ;
  - les libellés de la sélection de comparaison passent de `text-small` à la taille de `Label`.
- **Non comparé au Figma.**

