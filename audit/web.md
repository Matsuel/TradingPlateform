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

Mesure hors `components/ui/` et `constants/glossary.ts` : 5 148 lignes. Les plus gros fichiers font entre 140 et 200 lignes ; 10 composants dépassent 70 lignes.

| # | Où | Constat | Correction proposée |
| --- | --- | --- | --- |
| C1 | `features/backtest/stats.tsx` `BacktestResultBlocks` (131 l.), `features/backtest/comparison-blocks.tsx` `ComparisonMetrics` (102 l.) | La même table « métrique → libellé, aide, format » est écrite deux fois : CAGR → `formatRatio`, volatilité → `formatPercent`, etc. Chaque ligne de métrique fait 8 lignes de JSX. | Une table `metricDefinitions` dans `features/backtest/metrics.tsx`, avec `resultValue(r, m)` et `benchmarkValue(b, m)`. Les lignes deviennent un `map` sur une liste de clés. Découper en `PerformanceBlock`, `RiskBlock` et `CostsBlock`, déplacés dans `result-metrics.tsx` (`stats.tsx` est réservé aux `StatCard`). Gain estimé : environ −120 lignes. |
| C2 | `features/backtest/result-overview.tsx` (104 l.), `features/backtest/comparison-overview.tsx` (70 l.) | La même paire de graphiques est dupliquée : valeur en `h-56` avec `hideXAxis`, puis libellé « Drawdown » et courbe de drawdown en `h-24` avec `formatRate` et `formatRatio`. | Composant `ValueDrawdownCharts`. Sortir aussi l'en-tête « Valeur finale / plus-value » dans `ResultHeadline`. |
| C3 | `components/chart.tsx` `PriceAreaChart` (15 props, 105 l.) | Trois `<Area>` presque identiques, deux modes de couleur, et un nom « Price » alors que le composant trace aussi un drawdown. | Une liste de séries `{ key, label, color, dashed }` rendue par un `map`, et un nom neutre (`AreaSeriesChart`). Il ne reste que 3 appelants une fois C2 fait. |
| C4 | `components/form/fields/allocation-field.tsx` (111 l., 13 niveaux d'indentation) | Le rendu d'une ligne est écrit directement dans le render-prop. | Composant `AllocationRow`. Déplacer `allocationTotal` et `FULL_PERCENT` (règle de domaine) dans `features/backtest`. |
| C5 | `components/symbol-picker.tsx` (98 l.) | Quatre blocs conditionnels répètent `!tooShort && !isSearching && !error…`. | Calculer un état unique (`"tooShort" \| "searching" \| "error" \| "empty" \| "results"`), puis un seul `switch` d'affichage. |
| C6 | `features/backtest/backtest-detail.tsx` (84 l.) | L'état de la table des ordres (`allTrades`, `tradePage`, découpage) vit dans l'écran. | Section `trades-table.tsx` ; l'écran garde la composition et la mutation de relance. |
| C7 | `components/data-table/data-table.tsx` (191 l.) | `TablePagination` (60 l.) partage le fichier de `DataTable`. | Fichier `data-table/table-pagination.tsx`. |
| C8 | `apps/web/COMPONENTS.md` (1 500 l.) | Les colonnes « Utilisé par » sont à retoucher à chaque refacto (constaté sur chaque lot de ce chantier). Les tableaux de props recopient les types. | Retirer « Utilisé par » (un `grep` le donne) et garder rôle, exemple et props non évidentes. Environ −40 %. |
| C9 | Règle manquante | Aucun seuil de taille n'est écrit. | Ajouter dans `apps/web/AGENTS.md` : fichier ≤ 150 lignes, composant ≤ 60 lignes, ≤ 8 props. Ajouter dans `verify` un avertissement sur un `.tsx` de plus de 150 lignes. |

### Ordre conseillé

Un commit par point :

1. C1 et C2 : le plus gros gain, et des doublons réels.
2. C4, C5 et C6.
3. C3, C7, C8 et C9.

### Décisions ouvertes

- Appliquer tout (C1 à C9), ou seulement le code (C1 à C6) ?
- C3 : renommer `PriceAreaChart` ?
- C8 : alléger `COMPONENTS.md` ?
