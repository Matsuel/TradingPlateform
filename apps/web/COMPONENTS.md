# Catalogue web (apps/web)

Catalogue de ce que le web expose pour être réutilisé : composants partagés de `src/components/`, champs de formulaire, formatters et helpers de `src/lib/`, et sommaire de tout le catalogue. Les exports publics de chaque `src/features/<domaine>/` vivent dans `src/features/<domaine>/COMPONENTS.md` (même gabarits, listés au sommaire). Lis d'abord le sommaire, puis seulement l'entrée utile, avant d'utiliser ou de créer un composant. Toute création, modification ou suppression d'un élément catalogué met à jour son entrée **dans le même diff que le code**, selon les gabarits ci-dessous. En cas d'écart, le code fait foi : corrige l'entrée. Les appelants ne sont pas listés : `grep` le nom de l'export.

## Gabarits

Composant :

````markdown
### NomDuComposant

- **Import** : `import { NomDuComposant } from "@/components/..."` (export nommé).
- **Rôle** : une phrase, quand l'utiliser.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `prop` | `string` | oui | — | … (unité si nombre) |

- **Exemple** (tiré de `chemin/du/fichier.tsx`) :
  ```tsx
  <NomDuComposant prop="…" />
  ```
- **Source** : `src/components/....tsx`.
````

Composant d'une feature (`features/<domaine>/`, écran ou section) : même gabarit, mais props en liste (`- \`nom\` (optionnel) : rôle`) et sans exemple, car la page qui le compose en tient lieu.

Module de fonctions, hooks, constantes ou types (`lib/*.ts`, `features/<domaine>/api.ts`, `hook.ts`, `constants.ts`…). La signature se lit dans le code (types et JSDoc) : le tableau dit à quoi sert l'export et ses unités.

````markdown
### `chemin/fichier.ts`

- **Import** : `import { a, b } from "@/…/fichier"`.

| Export | Rôle (et unité) |
| --- | --- |
| `a` | … |
````

## Sommaire

Une ligne par entrée : le détail (import, props, exemple) est dans l'entrée liée. Les exports de chaque feature sont dans `src/features/<domaine>/COMPONENTS.md`.

- [`components/ui`](#componentsui)
- [Mise en page et navigation](#mise-en-page-et-navigation)
  - [PageLayout](#pagelayout) : conteneur racine de chaque page de `app/app/` (colonne, `gap-6`, marges `px-8 py-6`)
  - [PageHeader](#pageheader) : en-tête de page 
  - [AppHeader](#appheader) : barre du haut de l'espace `/app` 
  - [AppSidebar](#appsidebar) : sidebar repliable de l'espace `/app` 
  - [SidebarNav](#sidebarnav) : une section du menu 
  - [NavUser](#navuser) : menu utilisateur en pied de sidebar 
  - [ThemeToggle](#themetoggle) : bouton icône soleil/lune ouvrant un menu Clair / Sombre / Système
  - [AppSheet](#appsheet) : panneau latéral droit ouvert par un déclencheur, avec titre et description
  - [InfoHint](#infohint) : libellé d'une donnée calculée, souligné en pointillés
- [Données et tableaux](#données-et-tableaux)
  - [DataTable](#datatable) : tableau branché sur une requête TanStack Query (`query`) ou sur des lignes déjà chargées (`rows`) 
  - [TableCard](#tablecard) : cadre d'un tableau (bordure, marges) avec, s'il y en a, titre, description et actions au-dessus
  - [SymbolCell](#symbolcell) : logo (ou initiale) + symbole + nom, en cellule de tableau (`md`) ou en tête de page (`lg`)
  - [ChangeCell](#changecell) : variation signée suivie de « % », colorée par `trendOf` 
  - [Dash](#dash) : tiret « — » atténué pour une valeur absente
  - [OptionSelect](#optionselect) : liste déroulante d'options `{ value, label }` pleine largeur, hors formulaire
  - [FilterTabs](#filtertabs) : onglets de filtre contrôlés, typés par l'union des valeurs
  - [StatCard](#statcard) : carte de métrique 
  - [EmptyCard](#emptycard) : carte d'état vide (`Card` + `Empty`) 
  - [DetailRow](#detailrow) : ligne d'une liste `<dl>` 
  - [LoadingState](#loadingstate) : spinner `Loader2` centré, pendant le chargement d'une requête (`isPending`)
  - [ErrorState](#errorstate) : message d'erreur d'une requête et bouton « Réessayer », centrés (`isError`)
- [Graphiques](#graphiques)
  - [AreaSeriesChart](#areaserieschart) : courbes datées sur un axe commun, une `Area` par série
  - [ChartLegend](#chartlegend) : légende d'un graphique (maquette 15.1), tirée de ses `ChartSeries` 
  - [Sparkline](#sparkline) : mini-courbe sans axe pour une colonne « Tendance »
- [Symboles](#symboles)
  - [SymbolPicker](#symbolpicker) : dialogue de recherche de symbole
- [Formulaires (`components/form`)](#formulaires-componentsform)
  - [AppField](#appfield) : base de tous les champs 
  - [TextField](#textfield) : saisie texte d'une valeur `string`
  - [NumberField](#numberfield) : saisie d'un `number` 
  - [TextareaField](#textareafield) : saisie texte multiligne d'une valeur `string`
  - [SelectField](#selectfield) : choix d'une valeur `string` parmi des options, rendu par `OptionSelect` 
  - [DatePicker](#datepicker) : sélecteur de date seul (bouton + calendrier), hors react-hook-form 
  - [DateField](#datefield) : choix d'une date (`Date`) dans un calendrier en popover, affichée `dd/MM/yyyy`
  - [CheckboxField](#checkboxfield) : case à cocher d'une valeur `boolean`, texte à droite
  - [SwitchField](#switchfield) : interrupteur d'une valeur `boolean`, texte à gauche et contrôle à droite
  - [SymbolsField](#symbolsfield) : liste de symboles (`string[]`) en chips, ajout via `SymbolPicker`, retrait par la croix
  - [`components/form/form-issues.ts`](#componentsformform-issuests) : exports `setFormIssues`
  - [FormSection](#formsection) : carte titrée qui regroupe des champs (grille `gap-4`)
  - [FieldRow](#fieldrow) : place des champs côte à côte (2 colonnes à partir de `sm`)
- [`lib`](#lib)
  - [`lib/format.ts`](#libformatts) : exports `locale`, `formatPrice`, `formatChange`, `formatRatio`, `formatRate`, `formatPercent` …
  - [`lib/api.ts`](#libapits) : exports `apiFetch`, `useApiErrorMessages`, `ApiError`, `apiIssues`
  - [`lib/pagination.ts`](#libpaginationts) : exports `PaginationParams`, `getPageItems`, `paginate`
  - [`lib/routes.ts`](#libroutests) : exports `prefix`, `routes`, `safeRedirect`
  - [`lib/navigation.ts`](#libnavigationts) : exports `findActiveTab`
  - [`lib/env.ts`](#libenvts) : exports `env`
  - [`lib/trend.ts`](#libtrendts) : exports `Trend`, `trendOf`, `trendStyles`
  - [`lib/utils.ts`](#libutilsts) : exports `cn`
  - [`lib/auth.ts`](#libauthts) : exports `authClient`, `signIn`, `signUp`, `signOut`, `useSession`
  - [`lib/session.ts`](#libsessionts) : exports `getSession`, `requireSession`, `isAdmin`, `hasAdminRole`
- [`constants`](#constants)
  - [`constants/pagination.ts`](#constantspaginationts) : exports `PAGE_SIZE`
  - [`constants/sidebar.tsx`](#constantssidebartsx) : exports `SidebarTab`, `SidebarSection`, `sidebarSections`
  - [`constants/theme.ts`](#constantsthemets) : exports `themes` / `Theme`
  - [`constants/glossary.ts`](#constantsglossaryts) : exports `GlossaryEntry`, `GLOSSARY`, `GlossaryKey`
- [`hooks`](#hooks)
  - [`hooks/use-debounced-value.ts`](#hooksuse-debounced-valuets) : exports `useDebouncedValue`
- [`i18n`](#i18n)

Catalogues par feature (exports publics : écrans, sections, `api.ts`, `hook.ts`, `schema.ts`, `constants.ts`, `utils.ts`, `column.tsx`, `types.ts`) :

- [`features/auth`](src/features/auth/COMPONENTS.md)
  - [LoginForm](src/features/auth/COMPONENTS.md#loginform) : formulaire de connexion (email + mot de passe) dans une `FormSection` 
  - [RegisterForm](src/features/auth/COMPONENTS.md#registerform) : formulaire d'inscription (nom + email + mot de passe) dans une `FormSection` 
  - [`features/auth/api.ts`](src/features/auth/COMPONENTS.md#featuresauthapits) : exports `login`, `register`
  - [`features/auth/hook.ts`](src/features/auth/COMPONENTS.md#featuresauthhookts) : exports `useLogin`, `useRegister`
  - [`features/auth/schema.ts`](src/features/auth/COMPONENTS.md#featuresauthschemats) : exports `createLoginSchema(t)` / `LoginValues`, `createRegisterSchema(t)` / `RegisterValues`
- [`features/backtest`](src/features/backtest/COMPONENTS.md)
  - [BacktestList](src/features/backtest/COMPONENTS.md#backtestlist) : écran liste 
  - [BacktestDetail](src/features/backtest/COMPONENTS.md#backtestdetail) : écran détail (maquette 13 v2 · A) 
  - [BacktestDividends](src/features/backtest/COMPONENTS.md#backtestdividends) : écran « Dividendes et change » (maquette 31, route `routes.backtestDividends(id)`), ouvert par le bouton
  - [ReturnBreakdownCard](src/features/backtest/COMPONENTS.md#returnbreakdowncard) : carte « Décomposition du rendement » 
  - [DividendValueChart](src/features/backtest/COMPONENTS.md#dividendvaluechart) : carte « Valeur du portefeuille » de la page dividendes 
  - [DividendsTable](src/features/backtest/COMPONENTS.md#dividendstable) : table « Dividendes perçus » 
  - [TradesTable](src/features/backtest/COMPONENTS.md#tradestable) : table « Ordres » d'un résultat 
  - [StatusBadge](src/features/backtest/COMPONENTS.md#statusbadge) : badge du statut d'une exécution, libellé `backtest.status.<statut>` et variante de `statusVariants`
  - [NewBacktestForm](src/features/backtest/COMPONENTS.md#newbacktestform) : formulaire « Nouveau backtest »
  - [BacktestPreviewSummary](src/features/backtest/COMPONENTS.md#backtestpreviewsummary) : carte « Récapitulatif » du formulaire « Nouveau backtest » (maquette 12.1), sous `FormProvider` d'un
  - [QuickBacktestForm](src/features/backtest/COMPONENTS.md#quickbacktestform) : test rapide sur un seul symbole
  - [AllocationField](src/features/backtest/COMPONENTS.md#allocationfield) : allocation d'un portefeuille (`AllocationInput[]`) 
  - [GeneralSection](src/features/backtest/COMPONENTS.md#generalsection) : section « Général » (`name`, puis `InvestmentModeFields`) d'un formulaire `BacktestValues`, sous
  - [AllocationSection](src/features/backtest/COMPONENTS.md#allocationsection) : section « Allocation et période »
  - [InvestmentModeFields, PeriodAndCapitalFields](src/features/backtest/COMPONENTS.md#investmentmodefields-periodandcapitalfields) : champs communs au formulaire complet et au test rapide, sous `FormProvider`
  - [ResultOverview](src/features/backtest/COMPONENTS.md#resultoverview) : carte principale d'un résultat 
  - [ValueDrawdownCharts](src/features/backtest/COMPONENTS.md#valuedrawdowncharts) : courbe de valeur (montants `formatAmount`, `h-56`) puis, dessous et sur le même axe des dates, drawdown
  - [MetricBlock](src/features/backtest/COMPONENTS.md#metricblock) : carte d'indicateurs en liste 
  - [ResultDetails](src/features/backtest/COMPONENTS.md#resultdetails) : carte de sections repliables (`ui/collapsible`) en bas du détail 
  - [BacktestAssumptions](src/features/backtest/COMPONENTS.md#backtestassumptions) : liste « Hypothèses » d'un résultat, sans carte, en deux colonnes à partir de `sm` 
  - [ExecutionList](src/features/backtest/COMPONENTS.md#executionlist) : lignes d'exécution, sans carte 
  - [BacktestStats](src/features/backtest/COMPONENTS.md#backteststats) : 4 `StatCard` de la liste 
  - [ResultMetrics](src/features/backtest/COMPONENTS.md#resultmetrics) : 3 `MetricBlock` d'un résultat, sur 2 colonnes à partir de `md` et 3 à partir de `xl` 
  - [`features/backtest/metrics.tsx`](src/features/backtest/COMPONENTS.md#featuresbacktestmetricstsx) : exports `Metric`, `metricDefinitions`, `resultValue(f, result, metric)`, `withBenchmark`
  - [BacktestCompare](src/features/backtest/COMPONENTS.md#backtestcompare) : écran comparaison (maquette 19 v2) 
  - [ComparisonSelection](src/features/backtest/COMPONENTS.md#comparisonselection) : carte de choix des backtests A et B parmi les `COMPARABLE_LIMIT` plus récents qui ont un résultat terminé,
  - [ComparisonOverview](src/features/backtest/COMPONENTS.md#comparisonoverview) : carte « Valeur des portefeuilles » 
  - [ComparisonMetrics, ComparisonParameters](src/features/backtest/COMPONENTS.md#comparisonmetrics-comparisonparameters) : deux `MetricBlock`
  - [`features/backtest/batch/backtest-batch.tsx`](src/features/backtest/COMPONENTS.md#featuresbacktestbatchbacktest-batchtsx) : Page d'un lot de départs (maquette 32, `/app/backtest/batch/[batchId]`) 
  - [`features/backtest/api.ts`](src/features/backtest/COMPONENTS.md#featuresbacktestapits) : exports `createBacktest`, `createBacktestBatch`, `getBacktestBatch`, `restartBacktestBatch`,
  - [`features/backtest/hook.ts`](src/features/backtest/COMPONENTS.md#featuresbacktesthookts) : exports `useCreateBacktest`, `useCreateBacktestBatch`, `useRestartBacktestBatch`, `useRerunBacktestBatch`,
  - [`features/backtest/schema.ts`](src/features/backtest/COMPONENTS.md#featuresbacktestschemats) : exports `createBacktestFormSchema(t)`, `BacktestValues`, `createQuickBacktestFormSchema(t)`,
  - [`features/backtest/constants.ts`](src/features/backtest/COMPONENTS.md#featuresbacktestconstantsts) : exports `BACKTEST_CURRENCY`, `activeStatuses`, `investmentModes`, `rebalanceFrequencies`,
  - [`features/backtest/utils.ts`](src/features/backtest/COMPONENTS.md#featuresbacktestutilsts) : exports `getExecution`, `hasStatus`, `isActive`, `getExecutionDuration(t, e)`, `fromDecimal`,
  - [`features/backtest/column.tsx`](src/features/backtest/COMPONENTS.md#featuresbacktestcolumntsx) : exports `useBacktestColumns()`, `useBatchColumns(endDate)`, `useRollingColumns()`, `useTradeColumns()`,
  - [`features/backtest/types.ts`](src/features/backtest/COMPONENTS.md#featuresbacktesttypests) : voir l'entrée
- [`features/market`](src/features/market/COMPONENTS.md)
  - [MarketList](src/features/market/COMPONENTS.md#marketlist) : écran marché 
  - [SymbolDetail](src/features/market/COMPONENTS.md#symboldetail) : écran d'un symbole 
  - [PriceChart](src/features/market/COMPONENTS.md#pricechart) : carte « Prix » d'un symbole avec onglets `FilterTabs` sur `periods`
  - [SymbolSearch](src/features/market/COMPONENTS.md#symbolsearch) : bouton « Rechercher un symbole… » qui ouvre `SymbolPicker` et navigue vers `routes.symbol(symbol)`
  - [SymbolSheet](src/features/market/COMPONENTS.md#symbolsheet) : bouton « Tester » ouvrant un `AppSheet` « Test rapide · <symbole> » qui contient `QuickBacktestForm`
  - [`features/market/api.ts`](src/features/market/COMPONENTS.md#featuresmarketapits) : exports `getDefaultAssets`, `getAssetsDetails`, `getSearchAssets`
  - [`features/market/hook.ts`](src/features/market/COMPONENTS.md#featuresmarkethookts) : exports `useDefaultAssets`, `useMarketDetails`, `useMarketSearch`
  - [`features/market/constants.ts`](src/features/market/COMPONENTS.md#featuresmarketconstantsts) : exports `MARKET_CURRENCY`, `MIN_SEARCH_LENGTH`, `periods`
  - [`features/market/column.tsx`](src/features/market/COMPONENTS.md#featuresmarketcolumntsx) : exports `useMarketColumns()`
  - [`features/market/types.ts`](src/features/market/COMPONENTS.md#featuresmarkettypests) : exports `Period`, `MarketAsset`, `MarketDetails`, `MarketData`
- [`features/settings`](src/features/settings/COMPONENTS.md)
  - [SettingsTabs](src/features/settings/COMPONENTS.md#settingstabs) : barre d'onglets des paramètres (`ui/tabs`) 
  - [SettingsCard](src/features/settings/COMPONENTS.md#settingscard) : carte d'un réglage (maquette `06.2`) 
  - [ThemeCard](src/features/settings/COMPONENTS.md#themecard) : carte « Thème » 
  - [LanguageCard](src/features/settings/COMPONENTS.md#languagecard) : carte « Langue et région » 

## `components/ui`

Primitives shadcn (base-ui), voir la doc shadcn. Seule base des briques d'interface (`AGENTS.md`, « shadcn d'abord ») : un composant manquant s'ajoute par `bunx --bun shadcn@latest add <nom>`, un style manquant par un variant de son `cva`. Chaque variant ajouté au-delà de shadcn est listé ici.

- `ui/badge.tsx` : variant `success` (bordure et texte `--success`) : statut terminé, achat, hausse. Taille `lg` (`size="lg"`) : pastille plus haute qui porte un bouton (symbole retirable de `SymbolsField`).
- `ui/button.tsx` : variant `hint` avec la taille `inline` : libellé souligné en pointillés qui garde la typographie du parent, déclencheur d'`InfoHint`. Taille `inline` : sans hauteur ni marge. Variant `tile` (avec `inline`) : tuile cliquable sans fond ni survol, contenu libre (aperçus de `ThemeCard`).
- `ui/card.tsx` : taille `compact` (`<Card size="compact">`) : titre `text-body-semibold`, description `text-small` ; cartes de données (indicateurs, graphiques, récapitulatif).
- `ui/table.tsx` : `TableRow` `variant` `static` (sans survol, ligne d'état) et `plain` (sans bordure ni survol) ; `TableHead` `variant` `caption` (en-tête discret) et `row` (libellé de ligne) ; `TableCell` `variant` `strong` et `muted`. Utilisés par `DataTable` et `MetricBlock`.
- `ui/progress.tsx` (ajouté par `shadcn add progress`) : `size` `md` (piste de 6 px) et `variant` `success` et `running` (pulsation, calcul en cours). Barres de poids d'`AllocationField` et d'exécution active.
- `ui/empty.tsx` (ajouté par `shadcn add empty`) : état vide, utilisé via `EmptyCard`.

- `ui/pagination.tsx` (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`) : généré par `bunx --bun shadcn@latest add pagination`, non modifié ; libellés anglais par défaut, passer `text` et `aria-label` en français. Utilisé seulement via la prop `pagination` de `DataTable`.

## Mise en page et navigation

### PageLayout

- **Import** : `import { PageLayout } from "@/components/page-layout"`.
- **Rôle** : conteneur racine de chaque page de `app/app/` (colonne, `gap-6`, marges `px-8 py-6`).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `className` | `string` | non | — | Fusionnée via `cn`. |
  | `...props` | `React.HTMLAttributes<HTMLDivElement>` | non | — | Transmises au `div` (dont `children`). |

- **Exemple** (tiré de `src/app/app/backtest/[id]/page.tsx`) :
  ```tsx
  <PageLayout>
      <BacktestDetail id={id} />
  </PageLayout>
  ```
- **Source** : `src/components/page-layout.tsx`.

### PageHeader

- **Import** : `import { PageHeader } from "@/components/page-layout"`.
- **Rôle** : en-tête de page : titre, badge, description, élément de tête et actions à droite. Une page pas encore construite n'affiche que lui (titre et description).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `title` | `string` | non | — | Titre `h2` ; sans titre, `badge` n'est pas affiché. |
  | `description` | `string` | non | — | Sous le titre. |
  | `badge` | `ReactNode` | non | — | À droite du titre (ex. statut). |
  | `leading` | `ReactNode` | non | — | Avant le bloc titre (ex. `SymbolCell size="lg"`). |
  | `actions` | `ReactNode` | non | — | Boutons à droite. |
  | `className` | `string` | non | — | Sur le conteneur. |

- **Exemple** (tiré de `src/app/app/risk/page.tsx`) :
  ```tsx
  <PageHeader title="Risque" description="Corrélations, concentration, VaR/CVaR et contribution au risque d’un portefeuille." />
  ```
- **Source** : `src/components/page-layout.tsx`.

### AppHeader

- **Import** : `import { AppHeader } from "@/components/app-header"`.
- **Rôle** : barre du haut de l'espace `/app` : bouton de repli de la sidebar et fil d'Ariane « section › onglet » (`findActiveTab`). Sur une sous-page, l'onglet est un lien vers sa liste ; hors du menu (paramètres), pas de fil.
- **Props** : aucune.
- **Source** : `src/components/app-header.tsx`.

### AppSidebar

- **Import** : `import { AppSidebar } from "@/components/app-sidebar"`.
- **Rôle** : sidebar repliable de l'espace `/app` : marque (lien vers le dashboard), sections de `constants/sidebar.tsx` (les sections `adminOnly` seulement si `isAdmin`), menu utilisateur et choix du thème en pied.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `user` | `User` (better-auth) | oui | — | Utilisateur de la session, passé à `NavUser`. |
  | `isAdmin` | `boolean` | oui | — | Affiche les sections `adminOnly` ; l'accès reste vérifié par le layout `(admin)`. |

- **Exemple** (tiré de `src/app/app/layout.tsx`) :
  ```tsx
  <AppSidebar user={session.user} isAdmin={hasAdminRole(session.user.role)} />
  ```
- **Source** : `src/components/app-sidebar.tsx`.

### SidebarNav

- **Import** : `import { SidebarNav } from "@/components/sidebar-nav"`.
- **Rôle** : une section du menu : titre, puis un `Link` par onglet (navigation client, sans rechargement). Onglet actif : `findActiveTab(usePathname())`. Sidebar repliée : icône seule, nom en infobulle.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `section` | `SidebarSection` (`constants/sidebar.tsx`) | oui | — | Clé et onglets de la section ; libellés lus dans `navigation.*` des dictionnaires. |

- **Exemple** (tiré de `src/components/app-sidebar.tsx`) :
  ```tsx
  <SidebarNav key={section.key} section={section} />
  ```
- **Source** : `src/components/sidebar-nav.tsx`.

### NavUser

- **Import** : `import { NavUser } from "@/components/nav-user"`.
- **Rôle** : menu utilisateur en pied de sidebar : avatar, nom, email, lien « Compte » (`routes.settings`), « Se déconnecter » (`signOut`, retour à `routes.login`, `router.refresh`).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `user` | `User` (better-auth) | oui | — | Nom, email, image affichés. |

- **Source** : `src/components/nav-user.tsx`.

### ThemeToggle

- **Import** : `import { ThemeToggle } from "@/components/theme-toggle"`.
- **Rôle** : bouton icône soleil/lune ouvrant un menu Clair / Sombre / Système (`setTheme` de next-themes, valeurs de `constants/theme.ts`, libellés `theme.*`). Raccourci du réglage de Paramètres > Apparence (`ThemeCard`). Requiert le `ThemeProvider` de next-themes monté dans `app/layout.tsx`.
- **Props** : aucune.
- **Source** : `src/components/theme-toggle.tsx`.

### AppSheet

- **Import** : `import { AppSheet } from "@/components/app-sheet"`.
- **Rôle** : panneau latéral droit ouvert par un déclencheur, avec titre et description.
- **Props** :
  - `trigger` : Élément rendu comme déclencheur (`SheetTrigger render`).
  - `title` : Titre du panneau.
  - `description` (optionnel) : Sous le titre.
  - `children` (optionnel) : Contenu.
  - `className` (optionnel) : Sur `SheetContent`.
  - `open` (optionnel) : Mode contrôlé.
  - `onOpenChange` (optionnel) : Mode contrôlé.
- **Exemple** (tiré de `src/features/market/symbol-sheet.tsx`) :
  ```tsx
  <AppSheet title={symbol} trigger={<Button size="lg">Tester</Button>}>…</AppSheet>
  ```
- **Source** : `src/components/app-sheet.tsx`.

### InfoHint

- **Import** : `import { InfoHint } from "@/components/info-hint"`.
- **Rôle** : libellé d'une donnée calculée, souligné en pointillés (`Button variant="hint" size="inline"`, focusable, maquette 15.1), qui ouvre dans un `AppSheet` son entrée du glossaire (textes `glossary.<entrée>` des dictionnaires, dans la langue active ; `source` dans `constants/glossary.ts`) : « À quoi ça sert », « Comment c’est calculé », formule en `font-mono`, « Unité », « Comment le lire », valeur affichée, source (maquette 15). Le clic, y compris dans le panneau, n'atteint pas le parent (ligne de `DataTable` cliquable, libellé de champ). Garde la typographie du parent.
- **Props** :
  - `entry` (optionnel) : Clé de `GLOSSARY` ; absente, `children` est rendu seul (libellé sans aide), ce qui évite un test chez l'appelant.
  - `value` (optionnel) : Valeur déjà formatée par l'écran, rappelée dans le panneau sous « Valeur affichée » ; jamais recalculée.
  - `details` (optionnel) : Lignes ajoutées au bloc de valeurs (ex. « Creux atteint le », une colonne d'un tableau). Bloc masqué sans `value` ni `details`.
  - `children` : Libellé affiché.
- **Exemple** (tiré de `src/features/backtest/stats.tsx`) :
  ```tsx
  <InfoHint entry="completedRate" value={completedRate}>Taux de réussite</InfoHint>
  ```
- **Source** : `src/components/info-hint.tsx`.

## Données et tableaux

### DataTable

- **Import** : `import { DataTable, type Column } from "@/components/data-table/data-table"`.
- **Rôle** : tableau branché sur une requête TanStack Query (`query`) ou sur des lignes déjà chargées (`rows`) : gère chargement, erreur (`ErrorState`), vide, clic de ligne et pagination optionnelle. Colonnes déclarées dans `features/<domaine>/column.tsx`. Sans cadre : l'entourer de `TableCard` pour la bordure et le titre.
- **Props** :
  - `query` (optionnel) : Résultat de hook ; pour filtrer, passer `{ ...query, data }`.
  - `rows` (optionnel) : Lignes déjà en mémoire (ex. `result.trades` d'un détail déjà chargé) : pas d'état chargement / erreur.
  - `columns` : Colonnes.
  - `rowKey` : Clé React de ligne.
  - `onRowClick` (optionnel) : Rend les lignes cliquables.
  - `emptyMessage` (optionnel) : Affiché si `data` est vide.
  - `pagination` (optionnel) : Pied de tableau (`TablePagination`) : « 21–40 sur 57 », précédent / numéros (ellipses au-delà de 7 pages) / suivant ; masqué sur une seule page. `page` commence à 1, `count` = total toutes pages confondues ; `data` ne contient que la page affichée (page serveur ou `paginate`).
  `Column<T>` : `{ header: ReactNode; cell: (row: T) => ReactNode; className?: string }` (`className` appliquée à l'en-tête et aux cellules).

- **Exemple** (tiré de `src/features/backtest/backtest-list.tsx`) :
  ```tsx
  <TableCard title="Tous les backtests" description="Triés par date de lancement" actions={<FilterTabs … />}>
      <DataTable
          query={{ ...query, data: query.data?.data }}
          columns={columns}
          rowKey={(b) => b.id}
          onRowClick={(b) => router.push(routes.backtest(b.id))}
          emptyMessage="Aucun backtest."
          pagination={{ page, pageSize: PAGE_SIZE, count: query.data?.count ?? 0, onPageChange: setPage }}
      />
  </TableCard>
  ```
- **Source** : `src/components/data-table/data-table.tsx` (`StatusRow`, `DataRows` internes), `src/components/data-table/table-pagination.tsx`.

### TableCard

- **Import** : `import { TableCard } from "@/components/data-table/table-card"`.
- **Rôle** : cadre d'un tableau (bordure, marges) avec, s'il y en a, titre, description et actions au-dessus. Un tableau déjà dans un conteneur (section repliable) s'en passe.
- **Props** : `title?`, `description?`, `actions?` (`ReactNode`, ex. `FilterTabs`), `children` (le `DataTable`).
- **Source** : `src/components/data-table/table-card.tsx`.

### SymbolCell

- **Import** : `import { SymbolCell } from "@/components/data-table/cells"`.
- **Rôle** : logo (ou initiale) + symbole + nom, en cellule de tableau (`md`) ou en tête de page (`lg`).
- **Props** :
  - `symbol` : Ticker affiché ; sa 1re lettre sert de repli au logo.
  - `name` (optionnel) : Nom sous le symbole.
  - `logoUrl` (optionnel) : Image de l'avatar.
  - `size` (optionnel) : `md` : avatar 32 px ; `lg` : 48 px, symbole en `text-h2`.
  - `className` (optionnel) : Sur le conteneur.
- **Exemple** (tiré de `src/features/market/column.tsx`) :
  ```tsx
  { header: "Symbole", cell: (a) => <SymbolCell symbol={a.symbol} name={a.name} logoUrl={a.logoUrl} /> }
  ```
- **Source** : `src/components/data-table/cells.tsx`.

### ChangeCell

- **Import** : `import { ChangeCell } from "@/components/data-table/cells"`.
- **Rôle** : variation signée suivie de « % », colorée par `trendOf` : verte en hausse, rouge en baisse, neutre à zéro.
- **Props** :
  - `value` : **Pourcentage** (`1.5` → « +1,50 % ») ; un ratio doit être multiplié par 100 avant (ou utiliser `formatRatio` hors tableau). Format de la langue active (`+1.50%` en anglais).
- **Exemple** (tiré de `src/features/backtest/column.tsx`) :
  ```tsx
  return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
  ```
- **Source** : `src/components/data-table/cells.tsx`.

### Dash

- **Import** : `import { Dash, orDash } from "@/components/dash"`.
- **Rôle** : tiret « — » atténué pour une valeur absente. `orDash(value, format)` rend `format(value)`, ou `<Dash />` si `value` est `null`/`undefined` (résultat antérieur au champ).
- **Props** : aucune.
- **Exemple** (tiré de `src/features/backtest/stats.tsx`) :
  ```tsx
  orDash(fromDecimal(result.cagr), formatRatio)
  ```
- **Source** : `src/components/dash.tsx`.

### OptionSelect

- **Import** : `import { OptionSelect, type SelectOption } from "@/components/option-select"`.
- **Rôle** : liste déroulante d'options `{ value, label }` pleine largeur, hors formulaire (dans un formulaire : `SelectField`, qui l'utilise).
- **Props** :
  - `value` : Valeur choisie ; `""` = aucune, `placeholder` affiché.
  - `options` : Options proposées.
  - `onChange` : `""` si la valeur est effacée.
  - `id` (optionnel) : Sur le déclencheur, pour un `<label htmlFor>`.
  - `placeholder` (optionnel) : Sans valeur.
  - `invalid` (optionnel) : `aria-invalid` du déclencheur.
- **Exemple** (tiré de `src/features/backtest/comparison-selection.tsx`) :
  ```tsx
  <OptionSelect id={id} value={value} options={options} onChange={onChange} />
  ```
- **Source** : `src/components/option-select.tsx`.

### FilterTabs

- **Import** : `import { FilterTabs } from "@/components/filter-tabs"`.
- **Rôle** : onglets de filtre contrôlés, typés par l'union des valeurs.
- **Props** :
  - `value` : Onglet actif.
  - `onChange` : Changement d'onglet.
  - `options` : Onglets.
  - `className` (optionnel) : Sur `Tabs`.
- **Exemple** (tiré de `src/features/backtest/backtest-list.tsx`) :
  ```tsx
  <FilterTabs value={filter} onChange={changeFilter} options={filterOptions} />
  ```
- **Source** : `src/components/filter-tabs.tsx`.

### StatCard

- **Import** : `import { StatCard } from "@/components/stat-card"`.
- **Rôle** : carte de métrique : libellé, valeur, badge de tendance optionnel et légende. Groupes de cartes dans `features/<domaine>/stats.tsx`.
- **Props** :
  - `label` : Libellé (texte, ou `InfoHint` qui ouvre le glossaire).
  - `value` : Valeur déjà formatée.
  - `caption` (optionnel) : Légende ; masquée si falsy.
  - `delta` (optionnel) : Contenu du badge ; badge masqué si `null`/`undefined`.
  - `trend` (optionnel) : Style et icône du badge (`up` vert, `down` rouge).
  - `className` (optionnel) : Sur la carte.
- **Exemple** (tiré de `src/features/backtest/stats.tsx`) :
  ```tsx
  <StatCard label="En cours" value={stats?.active ?? <Dash />} caption="Backtests actifs" />
  ```
- **Source** : `src/components/stat-card.tsx`.

### EmptyCard

- **Import** : `import { EmptyCard } from "@/components/empty-card"`.
- **Rôle** : carte d'état vide (`Card` + `Empty`) : un message centré à la place d'un contenu pas encore disponible (comparaison sans sélection, backtest sans résultat).
- **Props** : `children` (le message).
- **Source** : `src/components/empty-card.tsx`.

### DetailRow

- **Import** : `import { DetailRow } from "@/components/detail-row"`.
- **Rôle** : ligne d'une liste `<dl>` : libellé atténué à gauche (`InfoHint` si `hint`), valeur à droite ; `divided` ajoute un trait sous la ligne.
- **Props** : `label`, `hint?: GlossaryKey`, `divided?: boolean`, `children` (valeur déjà formatée).
- **Exemple** (tiré de `src/features/backtest/assumptions.tsx`) :
  ```tsx
  <DetailRow divided label="Frais" hint="feeRate">{formatPercent(Number(backtest.feeRate))} par ordre</DetailRow>
  ```
- **Source** : `src/components/detail-row.tsx`.

### LoadingState

- **Import** : `import { LoadingState } from "@/components/query-status"`.
- **Rôle** : spinner `Loader2` centré, pendant le chargement d'une requête (`isPending`). La hauteur de la zone se passe par `className`.
- **Props** :
  - `className` (optionnel) : Sur le conteneur (ex. `h-64`).
- **Exemple** (tiré de `src/features/backtest/backtest-detail.tsx`) :
  ```tsx
  if (isPending) return <LoadingState className="h-64" />
  ```
- **Source** : `src/components/query-status.tsx`.

### ErrorState

- **Import** : `import { ErrorState } from "@/components/query-status"`.
- **Rôle** : message d'erreur d'une requête et bouton « Réessayer », centrés (`isError`).
- **Props** :
  - `message` (optionnel) : Texte affiché, en général `error.message`.
  - `onRetry` : Appelé au clic sur « Réessayer » (ex. `refetch`).
  - `className` (optionnel) : Sur le conteneur (ex. `h-64`).
- **Exemple** (tiré de `src/features/backtest/backtest-detail.tsx`) :
  ```tsx
  if (isError) return <ErrorState message={error.message} onRetry={refetch} className="h-64" />
  ```
- **Source** : `src/components/query-status.tsx`.

## Graphiques

### AreaSeriesChart

- **Import** : `import { AreaSeriesChart, referenceSeries, type ChartPoint, type ChartSeries } from "@/components/area-series-chart"`.
- **Rôle** : courbes datées sur un axe commun, une `Area` par série. L'appelant fournit les séries, les formats de date et de valeur. Couleur d'une tendance : `trendStyles[trend].color` (`lib/trend.ts`) ; `referenceSeries({ key, label, hint? })` une série de référence grise en pointillés (benchmark, investissement unique).
- **Props** :
  - `data` : Points ; une série absente un jour n'a pas de point (périodes différentes).
  - `series` : `fill` : aire remplie jusqu'à zéro (une seule série) ; `dashed` : série de référence en pointillés. Le nom de la série préfixe l'infobulle quand il y en a plusieurs.
  - `dateFormat` : `{ tick, tooltip }`, graduations de l'axe des dates et date de l'infobulle.
  - `valueFormat` : `{ tooltip, axis? }`, valeurs de l'infobulle (montant, ratio) et axe Y (optionnel).
  - `marker` (optionnel) : `{ date, key, label }`, pastille rouge et libellé sur la série `key` à `date` (pire fenêtre glissante).
  - `zeroLine` (optionnel) : trait plein à 0, pour des séries qui passent sous zéro (rendements).
  - `hideXAxis` (optionnel) : Graphique empilé au-dessus d'un autre qui porte l'axe des dates.
  - `className` (optionnel) : Hauteur.
- **Exemple** (tiré de `src/features/market/price-chart.tsx`) :
  ```tsx
  <AreaSeriesChart
      data={data}
      series={[{ key: "price", label: "Prix", color: trendStyles[trendOfPeriod(data)].color, fill: true }]}
      dateFormat={{ tick: (d) => formatTick(d, period), tooltip: (d) => formatTooltipDate(d, period) }}
      valueFormat={{ tooltip: (v) => formatPrice(v, MARKET_CURRENCY) }}
  />
  ```
- **Source** : `src/components/area-series-chart.tsx` (types `ChartPoint`, `ChartSeries`, `ChartMarker`, formats et `referenceSeries` dans `area-series-types.ts`, réexportés).

### ChartLegend

- **Import** : `import { ChartLegend } from "@/components/chart-legend"`.
- **Rôle** : légende d'un graphique (maquette 15.1), tirée de ses `ChartSeries` : trait de la couleur de chaque série (pointillé si `dashed`) et libellé, en `InfoHint` si la série a un `hint`.
- **Props** : `series: ChartSeries[]`.
- **Exemple** (tiré de `src/features/backtest/comparison-overview.tsx`) :
  ```tsx
  <ChartLegend series={valueSeries} />
  ```
- **Source** : `src/components/chart-legend.tsx`.

### Sparkline

- **Import** : `import { Sparkline } from "@/components/sparkline"`.
- **Rôle** : mini-courbe sans axe pour une colonne « Tendance ».
- **Props** :
  - `data` : Points `{ date, price }`.
  - `trend` : `Trend` (`lib/trend.ts`), couleur de la courbe.
  - `className` (optionnel) : Remplace la taille par défaut.
- **Exemple** (tiré de `src/features/market/column.tsx`) :
  ```tsx
  { header: "Tendance", cell: (a) => <Sparkline data={a.history} trend={trendOf(a.change24h)} /> }
  ```
- **Source** : `src/components/sparkline.tsx`.

## Symboles

### SymbolPicker

- **Import** : `import { SymbolPicker } from "@/components/symbol-picker"`.
- **Rôle** : dialogue de recherche de symbole (`useMarketSearch`, au moins `MIN_SEARCH_LENGTH` = 3 caractères, anti-rebond 500 ms via `useDebouncedValue`) ; résultats rendus en `SymbolCell` ; se ferme à la sélection. État de la recherche (`searchState`) et contenu de la liste (`SearchResults`, un `switch` par état) dans `symbol-search-results.tsx`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `open` | `boolean` | oui | — | Dialogue ouvert. |
  | `onOpenChange` | `(open: boolean) => void` | oui | — | Ouverture/fermeture. |
  | `onSelect` | `(item: MarketData) => void` | oui | — | Résultat choisi. |
  | `exclude` | `string[]` | non | `[]` | Symboles masqués des résultats (déjà choisis). |
  | `title` | `string` | non | `"Rechercher un symbole"` | Titre et placeholder. |

- **Exemple** (tiré de `src/components/form/fields/symbols-field.tsx`) :
  ```tsx
  <SymbolPicker
      open={open}
      onOpenChange={setOpen}
      exclude={symbols}
      title="Ajouter un symbole"
      onSelect={(item) => field.onChange([...symbols, item.symbol])}
  />
  ```
- **Source** : `src/components/symbol-picker.tsx`.

## Formulaires (`components/form`)

Tous les champs se placent sous un `FormProvider` de react-hook-form (ils lisent `useFormContext`) et affichent eux-mêmes libellé, description et erreur zod. `@/components/form` exporte les champs de `fields/index.ts` plus `FormSection` et `FieldRow` ; `AppField` s'importe de `@/components/form/field`.

Props communes `BaseProps<T>` (exportées par `field.tsx`), répétées dans chaque champ :

| Nom | Type | Requis | Défaut | Description |
| --- | --- | --- | --- | --- |
| `name` | `FieldPath<T>` | oui | — | Chemin du champ dans le formulaire. |
| `label` | `string` | non | — | Libellé. |
| `hint` | `GlossaryKey` | non | — | Rend le libellé cliquable (`InfoHint`) sur cette entrée du glossaire ; le clic ne donne pas le focus au champ et ne soumet pas le formulaire. |
| `description` | `string` | non | — | Aide sous le contrôle. |
| `className` | `string` | non | — | Sur le `Field`. |

### AppField

- **Import** : `import { AppField, type BaseProps, type RenderCtx } from "@/components/form/field"`.
- **Rôle** : base de tous les champs : relie un contrôle à react-hook-form et gère libellé/description/erreur (mise en page empilée ou en ligne par `FieldLayout`, interne). À utiliser pour créer un nouveau type de champ dans `fields/`.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `inline` | `boolean` | non | — | Contrôle à côté du texte (checkbox, switch). |
  | `reverse` | `boolean` | non | — | Avec `inline` : texte à gauche, contrôle à droite. |
  | `children` | `(ctx: RenderCtx<T>) => React.ReactNode` | oui | — | Rend le contrôle ; `ctx = { field, invalid }`. |

- **Exemple** (tiré de `src/components/form/fields/text-field.tsx`) :
  ```tsx
  <AppField {...base}>
      {({ field, invalid }) => (
          <Input {...field} id={field.name} type={type} placeholder={placeholder} aria-invalid={invalid} />
      )}
  </AppField>
  ```
- **Source** : `src/components/form/field.tsx`.

### TextField

- **Import** : `import { TextField } from "@/components/form"`.
- **Rôle** : saisie texte d'une valeur `string`.
- **Props** : `BaseProps<T>` + `type` (`"text" | "email" | "password"`, non requis, défaut `"text"`), `placeholder` (`string`, non requis).
- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <TextField name="name" label="Nom du backtest" />
  ```
- **Source** : `src/components/form/fields/text-field.tsx`.

### NumberField

- **Import** : `import { NumberField } from "@/components/form"`.
- **Rôle** : saisie d'un `number` ; un champ vide vaut `undefined` (le schéma zod signale « Requis »).
- **Props** : `BaseProps<T>` + `placeholder` (`string`, non requis). L'unité se met dans `label`.
- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <NumberField name="fee" label="Frais par ordre (%)" hint="feeRate" />
  ```
- **Source** : `src/components/form/fields/number-field.tsx`.

### TextareaField

- **Import** : `import { TextareaField } from "@/components/form"`.
- **Rôle** : saisie texte multiligne d'une valeur `string`.
- **Props** : `BaseProps<T>` + `rows` (`number`, non requis), `placeholder` (`string`, non requis).
- **Exemple** (aucun usage dans le dépôt) :
  ```tsx
  <TextareaField name="notes" label="Notes" rows={4} />
  ```
- **Source** : `src/components/form/fields/textarea-field.tsx`.

### SelectField

- **Import** : `import { SelectField } from "@/components/form"`.
- **Rôle** : choix d'une valeur `string` parmi des options, rendu par `OptionSelect` ; une valeur effacée devient `""`.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `options` | `SelectOption[]` (`{ value: string; label: string }`) | oui | — | Options, libellés traduits par l'appelant (ex. `investmentModes.map((value) => ({ value, label: t(value) }))`). |
  | `placeholder` | `string` | non | `"Sélectionner…"` | Sans valeur. |

- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <SelectField name="investmentMode" label="Mode d’investissement" options={investmentModes.map((value) => ({ value, label: t(value) }))} />
  ```
- **Source** : `src/components/form/fields/select-field.tsx`.

### DatePicker

- **Import** : `import { DatePicker } from "@/components/form"`.
- **Rôle** : sélecteur de date seul (bouton + calendrier), hors react-hook-form ; `DateField` l'enveloppe.
- **Props** : `value: Date | undefined`, `onChange(date)`, `id?`, `invalid?`, `placeholder?`, `disabled?(d)`.
- **Source** : `src/components/form/fields/date-picker.tsx`.

### DateField

- **Import** : `import { DateField } from "@/components/form"`.
- **Rôle** : choix d'une date (`Date`) dans un calendrier en popover, affichée `dd/MM/yyyy`.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `placeholder` | `string` | non | `"jj/mm/aaaa"` | Sans valeur. |
  | `disabled` | `(d: Date) => boolean` | non | — | Jours non sélectionnables. |

- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <FieldRow>
      <DateField name="start" label="Début" />
      <DateField name="end" label="Fin" />
  </FieldRow>
  ```
- **Source** : `src/components/form/fields/date-field.tsx`.

### CheckboxField

- **Import** : `import { CheckboxField } from "@/components/form"`.
- **Rôle** : case à cocher d'une valeur `boolean`, texte à droite.
- **Props** : `BaseProps<T>` seules.
- **Exemple** (aucun usage dans le dépôt) :
  ```tsx
  <CheckboxField name="accept" label="J'accepte les conditions" />
  ```
- **Source** : `src/components/form/fields/checkbox-field.tsx`.

### SwitchField

- **Import** : `import { SwitchField } from "@/components/form"`.
- **Rôle** : interrupteur d'une valeur `boolean`, texte à gauche et contrôle à droite.
- **Props** : `BaseProps<T>` seules.
- **Exemple** (aucun usage dans le dépôt) :
  ```tsx
  <SwitchField name="notifications" label="Notifications" description="Recevoir un email à la fin du calcul" />
  ```
- **Source** : `src/components/form/fields/switch-field.tsx`.

### SymbolsField

- **Import** : `import { SymbolsField } from "@/components/form"`.
- **Rôle** : liste de symboles (`string[]`) en chips, ajout via `SymbolPicker`, retrait par la croix.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `max` | `number` | non | — | Nombre maximal ; bouton d'ajout désactivé une fois atteint. |
  | `addLabel` | `string` | non | `"Ajouter"` | Libellé du bouton d'ajout. |

- **Exemple** :
  ```tsx
  <SymbolsField name="benchmarkSymbols" label="Benchmark" max={1} addLabel="Choisir" />
  ```
- **Source** : `src/components/form/fields/symbols-field.tsx`.

### `components/form/form-issues.ts`

- **Import** : `import { setFormIssues } from "@/components/form/form-issues"`.

| Export | Rôle (et unité) |
| --- | --- |
| `setFormIssues` | `setFormIssues(error, form.setError, issueMessage)` (`issueMessage` de `useApiErrorMessages`) dans le `catch` d'une mutation : chaque issue zod d'un `400` va sous le champ de son chemin, message traduit ; toute autre erreur est ignorée ici, l'écran l'affiche depuis la mutation. |

Source : `src/components/form/form-issues.ts`.

### FormSection

- **Import** : `import { FormSection } from "@/components/form"`.
- **Rôle** : carte titrée qui regroupe des champs (grille `gap-4`).
- **Props** :
  - `title` : Titre de la carte.
  - `description` (optionnel) : Sous le titre.
  - `className` (optionnel) : Sur la carte.
  - `children` : Champs.
- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <FormSection title="Général" description="Nom et mode d’investissement">
      <TextField name="name" label="Nom du backtest" />
      <InvestmentModeFields />
  </FormSection>
  ```
- **Source** : `src/components/form/layout.tsx`.

### FieldRow

- **Import** : `import { FieldRow } from "@/components/form"`.
- **Rôle** : place des champs côte à côte (2 colonnes à partir de `sm`).
- **Props** :
  - `children` : Champs.
  - `className` (optionnel) : Sur la grille.
- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <FieldRow>
      <NumberField name="initialAmount" label={`Capital initial (${currency})`} />
      <NumberField name="fee" label="Frais par ordre (%)" hint="feeRate" />
  </FieldRow>
  ```
- **Source** : `src/components/form/layout.tsx`.

## `lib`

### `lib/format.ts`

- **Import** : `import { useFormatters, type Formatters } from "@/lib/format"`.
- `useFormatters()` (composant ou hook) renvoie les formatters ci-dessous dans la langue active (cookie `locale`) : `const { formatPrice, formatRatio } = useFormatters()`. Un helper hors composant reçoit l'objet `Formatters` en premier argument (`formatAmount(f, v)`, `describe(f, backtest)`). Exemples donnés en français. `formatRatio` et `formatRate` convertissent une fraction en pourcentage : `formatRatio` pour une variation (signée), `formatRate` pour une proportion (non signée).

| Export | Rôle (et unité) |
| --- | --- |
| `locale` | Langue active, à passer à une librairie qui attend une locale (calendrier). Pour formater, utilise les formatters ci-dessous. |
| `formatDateWith` | Formatter de dates propre à un composant : `formatDateWith({ month: "short" })(date)`. |
| `formatYear` | Année seule : « 2024 » (axe des fenêtres glissantes). |
| `formatPointChange` | Écart en points de pourcentage, 1 décimale, signé : `4.4` → « +4,4 ». |
| `formatAxis` | Graduation numérique d'un axe : 2 décimales sous 10, entier au-delà. |
| `formatPrice` | Montant dans la devise ISO **obligatoire** : `formatPrice(1234.5, "EUR")` → « 1 234,50 € ». |
| `formatChange` | Nombre signé, 2 décimales, sans « % » : `1.5` → « +1,50 ». Pour un pourcentage déjà en %, ou un écart de Sharpe. |
| `formatRatio` | Ratio en **fraction** → variation signée en % : `0.342` → « +34,20 % ». Rendement, drawdown. |
| `formatRate` | Proportion en **fraction** → % non signé, arrondi à l'unité : `0.3846` → « 38 % ». Taux de réussite/échec, poids d'allocation, axe du drawdown. |
| `formatPercent` | Taux en **fraction** → % non signé, jusqu'à 2 décimales : `0.001` → « 0,1 % », `0.1532` → « 15,32 % ». Frais, volatilité, taux sans risque. |
| `formatSharpe` | Ratio de Sharpe, sans unité, 2 décimales : `1.25` → « 1,25 ». |
| `formatQuantity` | Quantité de titres, fractionnaires inclus (DCA) : jusqu'à 6 décimales. |
| `formatVolume` | Notation compacte : `41234567` → « 41,23 M ». |
| `formatDate` | Date et heure courtes : « 28/10/2026 09:00 ». |
| `formatDay` | Jour court : « 28/10/2026 ». |
| `formatDayRange` | Période : « 28/10/2025 – 28/10/2026 ». |
| `formatMonthTick` | Mois court et année pour un axe temporel : « janv. 24 ». |
| `formatMediumDate` | Date moyenne : « 28 oct. 2026 » (infobulle de graphique). |
| `currencySymbol` | Symbole d'une devise ISO pour un libellé : `currencySymbol("EUR")` → « € ». |
| `formatYears` | Durée en années, 1 décimale au plus (`10.5` → « 10,5 ans »). |
| `formatDuration` | Durée en jours calendaires : en jours sous deux mois (`45` → « 45 jours », `1` → « 1 jour »), sinon en mois arrondis (`426` → « 14 mois »). |

Source : `src/lib/format.ts`.

### `lib/api.ts`

- **Import** : `import { apiFetch, apiIssues } from "@/lib/api"` ; `import { useApiErrorMessages } from "@/lib/api-error"`.

| Export | Rôle |
| --- | --- |
| `apiFetch` | Seul point d'appel HTTP : préfixe `path` par `env.NEXT_PUBLIC_API_URL`, envoie les cookies, ajoute `Accept: application/json`. Statut non 2xx → `ApiError` (message `"Erreur API : <status> <statusText>"`) ; `204` → `undefined`. Routes : `apps/core-backend/API.md`. |
| `useApiErrorMessages` | Hook : `{ errorMessage(error), issueMessage(code) }` traduisent une erreur de core-backend en `errors.<code>` (langue active) ; code inconnu ou erreur qui n'est pas une `ApiError` → `errors.generic`. À utiliser à la place de `error.message` pour toute erreur d'API affichée (`lib/api-error.ts`). |
| `ApiError` | Erreur levée par `apiFetch` : `body` = corps JSON d'erreur (`{ error, code, ...data }`), `null` s'il n'est pas du JSON ; `code` = code stable (`ApiErrorCode`), `null` s'il est absent. |
| `apiIssues` | Issues zod d'un `400` (`{ error, issues }`), `{ path, code }` avec le chemin joint par des points (`"allocations.0.weight"`) et `code` = `params.code` de l'issue (`null` si zod natif) ; `[]` pour toute autre erreur. Dans un formulaire, passer par `setFormIssues` (`components/form/form-issues.ts`). |

Source : `src/lib/api.ts`.

### `lib/pagination.ts`

- **Import** : `import { getPageItems, paginate, type PaginationParams } from "@/lib/pagination"` ; le type de réponse `Paginated<T>` s'importe de `@azimut/contracts` (`import type`).

| Export | Rôle |
| --- | --- |
| `PaginationParams` | Query `?page&pageSize` d'une route de liste (`page` ≥ 1, `pageSize` 1 à 100). |
| `getPageItems` | Numéros affichés par la pagination : toutes les pages jusqu'à 7 ; au-delà, 7 éléments : `1 2 3 4 5 … 20`, `1 … 4 5 6 … 20`, `1 … 16 17 18 19 20`. |
| `paginate` | Découpe une liste complète en page (pagination client) ; `[]` au-delà de la dernière page. |

Source : `src/lib/pagination.ts`.

### `lib/routes.ts`

- **Import** : `import { routes, safeRedirect } from "@/lib/routes"`.
- Seule source des chemins : liens, redirections, sidebar. Jamais d'URL écrite à la main (`` `/app/backtest/${id}` ``) ailleurs. Exception : le `matcher` de `proxy.ts`, que Next lit à la compilation.

| Export | Rôle |
| --- | --- |
| `prefix` | Préfixe des pages connectées. |
| `routes` | URL de chaque page ; `symbol` encode le symbole (`^GSPC`). |
| `safeRedirect` | Destination après connexion : `redirect` s'il commence par `prefix` (et pas `//`), sinon le dashboard. |

Source : `src/lib/routes.ts`.

### `lib/navigation.ts`

- **Import** : `import { findActiveTab } from "@/lib/navigation"`.

| Export | Rôle |
| --- | --- |
| `findActiveTab` | Onglet de `constants/sidebar.tsx` qui correspond au chemin (avec `section` = clé de sa section), le plus long préfixe gagnant ; le dashboard ne matche qu'exactement. `undefined` hors du menu. |

Source : `src/lib/navigation.ts`.

### `lib/env.ts`

- **Import** : `import { env } from "@/lib/env"`.

| Export | Rôle |
| --- | --- |
| `env` | Variables d'environnement validées par zod au chargement (erreur explicite si absente ou invalide). `NEXT_PUBLIC_API_URL` : base de core-backend, `http://localhost:8000/api`. Seul lecteur de `process.env`. |

Source : `src/lib/env.ts`.

### `lib/trend.ts`

- **Import** : `import { trendOf, trendStyles, type Trend } from "@/lib/trend"`.
- Seule règle de couleur d'une variation : courbes, textes et badges la lisent ici.

| Export | Rôle (et unité) |
| --- | --- |
| `Trend` | `"up" \| "down" \| "neutral"`. |
| `trendOf` | `trendOf(change, higherIsBetter = true)` : `up` si la variation est favorable, `down` sinon, `neutral` à zéro (écart de volatilité : `higherIsBetter = false`). |
| `trendStyles` | Par tendance : `color` (variable CSS d'une courbe), `text` (classe de texte), `badge` (variant de `Badge`). |

Source : `src/lib/trend.ts`.

### `lib/utils.ts`

- **Import** : `import { cn } from "@/lib/utils"`.

| Export | Rôle |
| --- | --- |
| `cn` | Compose et fusionne des classes Tailwind conditionnelles. |

Source : `src/lib/utils.ts`.

### `lib/auth.ts`

- **Import** : `import { authClient } from "@/lib/auth"`. Routes : `ALL /api/auth/{*path}` dans `apps/core-backend/API.md`.

| Export | Rôle |
| --- | --- |
| `authClient` | Session côté serveur. |
| `signIn`, `signUp`, `signOut`, `useSession` | `signIn`/`signUp` ne s'appellent que via `features/auth/api.ts` ; `useSession` n'est pas utilisé. |

Source : `src/lib/auth.ts`.

### `lib/session.ts`

- **Import** : `import { requireSession } from "@/lib/session"`. Serveur uniquement (`server-only`).

| Export | Rôle |
| --- | --- |
| `getSession` | Session courante lue depuis le cookie entrant. |
| `requireSession` | Session ou redirection vers `routes.login`. |
| `isAdmin` | La session a le rôle `admin`. |
| `hasAdminRole` | `role` (liste séparée par des virgules) contient `admin`. |

Source : `src/lib/session.ts`.

## `constants`

### `constants/pagination.ts`

- **Import** : `import { PAGE_SIZE } from "@/constants/pagination"`.

| Export | Rôle |
| --- | --- |
| `PAGE_SIZE` | Lignes par page des tableaux (`pageSize` envoyé au backend, découpage client). |

Source : `src/constants/pagination.ts`.

### `constants/sidebar.tsx`

- **Import** : `import { sidebarSections, type SidebarSection, type SidebarTab } from "@/constants/sidebar"`.

| Export | Rôle |
| --- | --- |
| `SidebarTab` | Un onglet ; `key` = clé du libellé (`navigation.tabs.<key>` dans `messages/*.json`), `url` vient de `routes`. |
| `SidebarSection` | Une section du menu ; `key` = clé du libellé (`navigation.sections.<key>`). |
| `sidebarSections` | Menu, dans l'ordre de la roadmap : Vue d'ensemble (Dashboard, Notifications), Marché, Strategy Lab (Backtests, Nouveau backtest, Comparaison, Paper trading), Analyse (Risque, Projection, Optimisation, Rapports), Administration (`adminOnly` : Monitoring, Utilisateurs, Données de référence). Une page ajoutée = sa route dans `routes`, son libellé dans `messages/fr.json` et `messages/en.json`, puis son onglet ici. |

Source : `src/constants/sidebar.tsx`.

### `constants/theme.ts`

- **Import** : `import { themes, type Theme } from "@/constants/theme"`.

| Export | Rôle |
| --- | --- |
| `themes` / `Theme` | `light`, `dark`, `system` : valeurs de next-themes, aussi clés des libellés `theme.<valeur>` des dictionnaires. |

Source : `src/constants/theme.ts`.

### `constants/glossary.ts`

- **Import** : `import { GLOSSARY, type GlossaryEntry, type GlossaryKey } from "@/constants/glossary"`.

| Export | Rôle |
| --- | --- |
| `GlossaryEntry` | `{ source }` : fichier et symbole qui calculent la donnée (D3, feature 09). Les textes ne sont plus ici : `messages/fr.json` et `messages/en.json`, namespace `glossary.<clé>` (`title`, `purpose`, `computation`, `formula` et `readingTip` facultatifs, `unit`). |
| `GLOSSARY` | Une entrée (sa `source`) par donnée calculée affichée, dont la clé est aussi celle du dictionnaire : résultat (`finalValue`, `cagr`, `maxDrawdown`, `lumpSum`, `equityCurve`, ordres, positions…), hypothèses, récapitulatif du formulaire (`plannedContributions`, `plannedRebalances`), liste, comparaison (`comparisonDelta`), paramètres du formulaire, marché. |
| `GlossaryKey` | Clé passée à `InfoHint` (`entry`), à un champ, une ligne de `MetricBlock` ou une hypothèse (`hint`). |

Ajouter une donnée calculée à l'écran = ajouter sa `source` ici **et** ses textes dans les deux dictionnaires, dans le même diff (`AGENTS.md`) : `bun test` échoue si une clé manque d'un côté. Les phrases communes (montant en euros `{moneyUnit}`, en dollars `{marketMoneyUnit}`, rendement pondéré dans le temps `{twr}`) sont écrites une fois par langue dans `glossary.shared`. Relire les textes contre le symbole cité en `source` quand ce calcul change.

Source : `src/constants/glossary.ts`.

## `hooks`

### `hooks/use-debounced-value.ts`

- **Import** : `import { useDebouncedValue } from "@/hooks/use-debounced-value"`.

| Export | Rôle |
| --- | --- |
| `useDebouncedValue` | `value` recopiée après `delayMs` ms sans changement (debounce d'un appel API). Comparaison par référence : passer un objet de référence stable (`useWatch` + `compute`), sinon le délai repart à chaque rendu. |

Source : `src/hooks/use-debounced-value.ts`.


## `i18n`

Langue de l'interface : cookie `locale`, jamais l'URL. Dictionnaires dans `messages/<langue>.json` (mêmes clés partout), lus par `useTranslations` / `getTranslations` de `next-intl`.

| Export | Import | Rôle |
| --- | --- | --- |
| `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `LOCALE_COOKIE`, `LOCALE_LABELS` | `@/i18n/config` | Langues disponibles (`fr`, `en`), langue par défaut (`fr`), nom du cookie, nom affiché de chaque langue. Ajouter une langue : son code ici, son libellé, son fichier `messages/<code>.json`. |
| `setLocale(locale)` | `@/i18n/actions` | Server Action : écrit le cookie (un an) ; valeur inconnue ignorée. |
| (défaut) | `src/i18n/request.ts` | Configuration `next-intl` par requête : langue du cookie, sinon `DEFAULT_LOCALE`. Branchée par `next.config.ts`. |

Source : `src/i18n/`.
