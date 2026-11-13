# Catalogue web (apps/web)

Catalogue de ce que le web expose pour être réutilisé : composants partagés de `src/components/`, champs de formulaire, formatters et helpers de `src/lib/`, exports publics de chaque `src/features/<domaine>/`. Lis-le avant d'utiliser ou de créer un composant. Toute création, modification ou suppression d'un élément catalogué met à jour son entrée **dans le même diff que le code**, selon les gabarits ci-dessous. En cas d'écart, le code fait foi : corrige l'entrée. Les appelants ne sont pas listés : `grep` le nom de l'export.

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

- [`components/ui`](#componentsui)
- [Mise en page et navigation](#mise-en-page-et-navigation) : `PageLayout`, `PageHeader`, `AppHeader`, `AppSidebar`, `SidebarNav`, `NavUser`, `ThemeToggle`, `AppSheet`, `InfoHint`
- [Données et tableaux](#données-et-tableaux) : `DataTable` (`Column`), `TableCard`, `SymbolCell`, `ChangeCell`, `Dash` (`orDash`), `OptionSelect`, `FilterTabs`, `StatCard`, `EmptyCard`, `DetailRow`, `LoadingState`, `ErrorState`
- [Graphiques](#graphiques) : `AreaSeriesChart` (`ChartPoint`, `ChartSeries`, `referenceSeries`), `ChartLegend`, `Sparkline`
- [Symboles](#symboles) : `SymbolPicker`
- [Formulaires (`components/form`)](#formulaires-componentsform) : `AppField`, `TextField`, `NumberField`, `TextareaField`, `SelectField`, `DateField`, `CheckboxField`, `SwitchField`, `SymbolsField`, `FormSection`, `FieldRow`
- [`lib`](#lib) : `format.ts`, `api.ts`, `api-error.ts`, `pagination.ts`, `routes.ts`, `navigation.ts`, `env.ts`, `utils.ts`, `auth.ts`, `session.ts`
- [`constants`](#constants) : `pagination.ts`, `sidebar.tsx`, `theme.ts`, `glossary.ts`
- [`hooks`](#hooks) : `use-debounced-value.ts`
- [`features/auth`](#featuresauth)
- [`features/backtest`](#featuresbacktest)
- [`features/market`](#featuresmarket)
- [`features/settings`](#featuressettings)
- [`i18n`](#i18n)

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
  - `formatTick` : Graduations de l'axe des dates.
  - `formatTooltipDate` : Date de l'infobulle.
  - `formatValue` : Valeurs de l'infobulle (montant, ratio).
  - `formatAxis` (optionnel) : Axe Y.
  - `marker` (optionnel) : `{ date, key, label }`, pastille rouge et libellé sur la série `key` à `date` (pire fenêtre glissante).
  - `zeroLine` (optionnel) : trait plein à 0, pour des séries qui passent sous zéro (rendements).
  - `hideXAxis` (optionnel) : Graphique empilé au-dessus d'un autre qui porte l'axe des dates.
  - `className` (optionnel) : Hauteur.
- **Exemple** (tiré de `src/features/market/price-chart.tsx`) :
  ```tsx
  <AreaSeriesChart
      data={data}
      series={[{ key: "price", label: "Prix", color: trendStyles[trendOfPeriod(data)].color, fill: true }]}
      formatTick={(d) => formatTick(d, period)}
      formatTooltipDate={(d) => formatTooltipDate(d, period)}
      formatValue={(v) => formatPrice(v, MARKET_CURRENCY)}
  />
  ```
- **Source** : `src/components/area-series-chart.tsx`.

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
| `locale` | Langue active, pour un format `Intl` local à un composant (ticks de graphique, quantités). |
| `formatPrice` | Montant dans la devise ISO **obligatoire** : `formatPrice(1234.5, "EUR")` → « 1 234,50 € ». |
| `formatChange` | Nombre signé, 2 décimales, sans « % » : `1.5` → « +1,50 ». Pour un pourcentage déjà en %, ou un écart de Sharpe. |
| `formatRatio` | Ratio en **fraction** → variation signée en % : `0.342` → « +34,20 % ». Rendement, drawdown. |
| `formatRate` | Proportion en **fraction** → % non signé, arrondi à l'unité : `0.3846` → « 38 % ». Taux de réussite/échec, poids d'allocation, axe du drawdown. |
| `formatPercent` | Taux en **fraction** → % non signé, jusqu'à 2 décimales : `0.001` → « 0,1 % », `0.1532` → « 15,32 % ». Frais, volatilité, taux sans risque. |
| `formatSharpe` | Ratio de Sharpe, sans unité, 2 décimales : `1.25` → « 1,25 ». |
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

- **Import** : `import { getPageItems, paginate, type PaginationParams } from "@/lib/pagination"` ; le type de réponse `Paginated<T>` s'importe de `@trading-plateform/contracts` (`import type`).

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

## `features/auth`

Écrans : `LoginForm`, `RegisterForm`. Données : `api.ts`, `hook.ts`, `schema.ts`. Même forme que `features/backtest` : react-hook-form + schéma zod + champs de `components/form`. Une erreur better-auth est relancée en `AuthError` (`code`) par `api.ts` ; `useAuthErrorMessage()` (`hook.ts`) la traduit via `auth.errors.<code>`, avec repli sur le libellé d'échec du formulaire.

### LoginForm

- **Import** : `import { LoginForm } from "@/features/auth/login-form"`.
- **Rôle** : formulaire de connexion (email + mot de passe) dans une `FormSection` ; valide avec `createLoginSchema`, appelle `useLogin`, puis redirige vers `redirectTo` (prop requise, calculée par `safeRedirect` dans la page) et rafraîchit la session serveur. L’erreur better-auth s’affiche sous les champs ; lien vers `routes.register`.
- **Props** : aucune.
- **Source** : `src/features/auth/login-form.tsx`.

### RegisterForm

- **Import** : `import { RegisterForm } from "@/features/auth/register-form"`.
- **Rôle** : formulaire d'inscription (nom + email + mot de passe) dans une `FormSection` ; valide avec `createRegisterSchema`, appelle `useRegister`, puis redirige vers `routes.dashboard`. Lien vers `routes.login`.
- **Props** : aucune.
- **Source** : `src/features/auth/register-form.tsx`.

### `features/auth/api.ts`

- **Import** : `import { login } from "@/features/auth/api"`. Appeler via les hooks plutôt que directement.
- Les routes d'auth passent par le client better-auth (`signIn`/`signUp` de `lib/auth.ts`, cookies de session), pas par `apiFetch`. Une erreur better-auth est relancée en `Error(message)`.

| Export | Route (`apps/core-backend/API.md`) |
| --- | --- |
| `login` | `ALL /api/auth/{*path}` (`sign-in/email`) |
| `register` | `ALL /api/auth/{*path}` (`sign-up/email`) |

Source : `src/features/auth/api.ts`.

### `features/auth/hook.ts`

- **Import** : `import { useLogin } from "@/features/auth/hook"`.

| Export | Clé / comportement |
| --- | --- |
| `useLogin` | Mutation sans invalidation ; la redirection et `router.refresh()` sont faites par le formulaire. |
| `useRegister` | Idem. |

Source : `src/features/auth/hook.ts`.

### `features/auth/schema.ts`

- **Import** : `import { createLoginSchema, type LoginValues } from "@/features/auth/schema"`.

| Export | Rôle |
| --- | --- |
| `createLoginSchema(t)` / `LoginValues` | `t` = `useTranslations("auth.validation")` (messages dans la langue active). Connexion : le serveur juge le mot de passe. |
| `createRegisterSchema(t)` / `RegisterValues` | Même `t`. Inscription : bornes = défauts `emailAndPassword` de better-auth côté core-backend. |

Source : `src/features/auth/schema.ts`.

## `features/backtest`

Écrans et sections : composants ci-dessous. Données : modules `api.ts`, `hook.ts`, `schema.ts`, `constants.ts`, `utils.ts`, `column.tsx`, `types.ts`.

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

- **Import** : `import { BacktestDividends } from "@/features/backtest/backtest-dividends"`.
- **Rôle** : écran « Dividendes et change » (maquette 31, route `routes.backtestDividends(id)`), ouvert par le bouton « Dividendes et change » du détail (toujours affiché avec un résultat) : quatre `StatCard` (valeur finale, rendement total avec le cours seul, dividendes perçus, effet de change si hors EUR), `ReturnBreakdown`, courbe avec et sans dividendes (`ValueDrawdownCharts` sans drawdown ; absente sans `priceOnlyValue`) et `DividendsTable`. Un résultat antérieur ou sans dividende ni change affiche un `EmptyCard`. Instancie `useBacktest`.
- **Props** :
  - `id` : Id du backtest.
- **Source** : `src/features/backtest/backtest-dividends.tsx`.

### ReturnBreakdownCard

- **Import** : `import { ReturnBreakdownCard } from "@/features/backtest/return-breakdown"`.
- **Rôle** : carte « Décomposition du rendement » : cours seul, dividendes, rendement local, contribution du change, rendement en EUR, avec une barre proportionnelle à chaque valeur. Composantes en points, totaux en pourcentage ; sans change (`fx` null), lignes « devise locale » et « change » omises.
- **Props** : `breakdown` (`returnBreakdown` du moteur, ratios), `totalReturn` (ratio EUR).
- **Source** : `src/features/backtest/return-breakdown.tsx`.

### DividendValueChart

- **Import** : `import { DividendValueChart } from "@/features/backtest/dividend-value-chart"`.
- **Rôle** : carte « Valeur du portefeuille » de la page dividendes : courbe avec dividendes réinvestis et, en pointillés, le même portefeuille sans dividendes (`priceOnlyValue`), puis l'écart final (`dividendGain`). Renvoie `null` si aucun point n'a de `priceOnlyValue`.
- **Props** : `result: BacktestResult`.
- **Source** : `src/features/backtest/dividend-value-chart.tsx`.

### DividendsTable

- **Import** : `import { DividendsTable } from "@/features/backtest/dividends-table"`.
- **Rôle** : table « Dividendes perçus » : ex-date, actif, montant en EUR, parts rachetées ; du plus récent au plus ancien, paginée côté client (`PAGE_SIZE`), puis total et nombre de versements.
- **Props** : `events` (`dividendEvents` du moteur, du plus ancien au plus récent), `total` (`dividendTotal`, Decimal sérialisé ou null).
- **Source** : `src/features/backtest/dividends-table.tsx`.

### TradesTable

- **Import** : `import { TradesTable } from "@/features/backtest/trades-table"`.
- **Rôle** : table « Ordres » d'un résultat : les 5 plus récents (`RECENT_TRADES`), puis sur « Voir les N ordres » tous, paginés côté client (`paginate`, `PAGE_SIZE`), du plus récent au plus ancien.
- **Props** : `trades: Trade[]`, ordres du moteur du plus ancien au plus récent.
- **Source** : `src/features/backtest/trades-table.tsx`.

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

- **Import** : `import { BacktestPreviewSummary } from "@/features/backtest/preview-summary"`.
- **Rôle** : carte « Récapitulatif » du formulaire « Nouveau backtest » (maquette 12.1), sous `FormProvider` d'un formulaire `BacktestValues` : étapes Données / Simulation / Métriques (`previewSteps`, textes `backtest.preview.steps.*`), puis « Rebalancements prévus », « Versements prévus » et « Source des données » (`dataProviderLabels` · `backtest.priceType.<type>`) renvoyés par `useBacktestPreview` (estimations calendaires du backend, aucun calcul côté web) et mention « Estimation calendaire ». Valeurs validées par `createBacktestFormSchema(t).safeParse` dans `useWatch({ compute })`, appel débouncé de 500 ms (`useDebouncedValue`) ; `<Dash />` tant que le formulaire est invalide ou la réponse absente. Les trois libellés sont des `InfoHint` (`plannedRebalances`, `plannedContributions`, `dataSource`).
- **Props** : aucune.
- **Source** : `src/features/backtest/preview-summary.tsx`.

### QuickBacktestForm

- **Import** : `import { QuickBacktestForm } from "@/features/backtest/quick-backtest-form"`.
- **Rôle** : test rapide sur un seul symbole (`createQuickBacktestFormSchema`, nom `backtest.quick.name`, allocation `[{ symbol, weight: 100 }]`, défauts `DEFAULT_INVESTMENT_MODE`, `DEFAULT_INITIAL_AMOUNT`, `DEFAULT_FEE_PERCENT`, 1 an jusqu'à aujourd'hui ; champs `InvestmentModeFields` et `PeriodAndCapitalFields` partagés avec le formulaire complet ; récapitulatif `QuickTestSummary` et boutons `QuickTestActions` internes) ; un `400` du backend place chaque issue sous le champ de son chemin (`setFormIssues`) ; redirige vers le détail créé.
- **Props** :
  - `symbol` : Symbole testé.
- **Source** : `src/features/backtest/quick-backtest-form.tsx`.

### AllocationField

_Ligne et pied du champ : `allocation-row.tsx` (`AllocationRow`, `AllocationFooter`, internes à la feature)._

- **Import** : `import { AllocationField } from "@/features/backtest/allocation-field"` (seul domaine utilisateur, d'où sa place dans la feature).
- **Rôle** : allocation d'un portefeuille (`AllocationInput[]`) : une ligne par actif (symbole, nom, barre proportionnelle au poids, champ `%` entier de 1 à 100 au pas de 1, bouton de retrait), ajout via `SymbolPicker` (symbole déjà présent masqué et ignoré ; le nouvel actif reçoit le reste jusqu'à 100 %, vide s'il n'en reste pas), badge « Total » vert à 100 %, rouge sinon. Le total n'est qu'un affichage de la saisie : la somme = 100 se valide dans le schéma zod du formulaire.
- **Valeur** : `AllocationInput = Pick<Allocation, "symbol"> & { name?: string; weight: number }` ; `weight` en **pourcent entier** (60 = 60 %, D2), `NaN` quand le champ est vidé (rejeté par `z.number()`) ; `name` sert à l'affichage seulement. Le backend convertit le pourcent en ratio.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `addLabel` | `string` | non | `"Ajouter un actif"` | Libellé du bouton d'ajout. |

- **Erreurs** : une erreur sur toute l'allocation (`path: [<name>]` : vide, total ≠ 100, symbole en double) s'affiche sous le champ ; une erreur sur un poids (`<name>.<index>.weight` : vide, non entier, hors bornes) s'affiche sous sa ligne.
- **Helpers** : `FULL_PERCENT` (`100`, `constants.ts`), `allocationTotal(rows) => number` (`utils.ts`, somme des poids saisis en pourcent, `NaN` compte 0), `AllocationInput` (`types.ts`) ; utilisés par le badge, le schéma du formulaire et pour désactiver l'envoi. Rendu interne : une `AllocationRow` par actif.
- **Accessibilité** : le symbole et le nom de chaque ligne sont le `label` de son champ `%` (`id` = `<name>.<index>.weight`, qui reçoit `aria-invalid` si l'erreur zod porte sur ce poids) ; bouton de retrait `aria-label="Retirer <symbole>"` ; badge « Total » en `aria-live="polite"`.
- **Source** : `src/features/backtest/allocation-field.tsx`.

### GeneralSection

- **Import** : `import { GeneralSection } from "@/features/backtest/sections"`.
- **Rôle** : section « Général » (`name`, puis `InvestmentModeFields`) d'un formulaire `BacktestValues`, sous `FormProvider`.
- **Props** : `PeriodAndCapitalFields({ afterPeriod?: ReactNode })` ; `InvestmentModeFields` : aucune.
- **Source** : `src/features/backtest/sections.tsx`.

### AllocationSection

- **Import** : `import { AllocationSection } from "@/features/backtest/sections"`.
- **Rôle** : section « Allocation et période » (`allocations` via `AllocationField`, `PeriodAndCapitalFields`, `rebalanceFrequency` via `SelectField` « Rebalancement », aide « Ramène les poids à la cible », `benchmarkSymbols` via `SymbolsField` « Benchmark » à un symbole au plus, retirable pour simuler sans benchmark) d'un formulaire `BacktestValues`.
- **Props** : aucune.
- **Source** : `src/features/backtest/sections.tsx`.

### InvestmentModeFields, PeriodAndCapitalFields

- **Import** : `import { InvestmentModeFields, PeriodAndCapitalFields } from "@/features/backtest/sections"`.
- **Rôle** : champs communs au formulaire complet et au test rapide, sous `FormProvider`. `InvestmentModeFields` : mode d'investissement, puis versement mensuel en `RECURRING` seulement. `PeriodAndCapitalFields` : début et fin, puis `afterPeriod` (nœud optionnel : l'interrupteur de lot du formulaire complet), capital initial et frais par ordre (aide `feeRate`). Montants libellés avec `currencySymbol(BACKTEST_CURRENCY)`.
- **Props** : aucune.
- **Source** : `src/features/backtest/sections.tsx`.

### ResultOverview

- **Import** : `import { ResultOverview } from "@/features/backtest/result-overview"`.
- **Rôle** : carte principale d'un résultat : « Valeur finale » (`text-h1`), badge du rendement total, plus-value sur le montant investi (et rendement du benchmark s'il existe), légende des séries (Portefeuille, benchmark ou investissement unique, Drawdown ; libellés `InfoHint`, maquette 15.1), puis `ValueDrawdownCharts` (courbe de valeur, et drawdown dessous sur le même axe). En-tête interne : `ResultHeadline` (valeur finale, badge) et `ProfitLine`. Série en pointillés : benchmark (`benchmarkValue`) s'il existe, sinon investissement unique (`lumpSumValue`, DCA). Drawdown masqué si aucun point ne porte `drawdown` (résultat antérieur).
- **Props** :
  - `result` : Résultat complet.
- **Source** : `src/features/backtest/result-overview.tsx`.

### ValueDrawdownCharts

- **Import** : `import { ValueDrawdownCharts } from "@/features/backtest/value-drawdown-charts"`.
- **Rôle** : courbe de valeur (montants `formatAmount`, `h-56`) puis, dessous et sur le même axe des dates, drawdown (`formatRate` en axe, `formatRatio` en infobulle, `h-24`). `drawdown.data` vide (résultat antérieur) : seule la valeur s'affiche, avec son axe.
- **Props** : `value` et `drawdown`, chacun `{ data: ChartPoint[]; series: ChartSeries[] }` (voir `AreaSeriesChart`).
- **Source** : `src/features/backtest/value-drawdown-charts.tsx`.

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

- **Import** : `import { ResultDetails } from "@/features/backtest/result-details"`.
- **Rôle** : carte de sections repliables (`ui/collapsible`) en bas du détail : « Positions finales » (`DataTable` sans `TableCard`, `holdingColumns`) et « Hypothèses » (`BacktestAssumptions`) avec un résultat, puis « Historique d'exécution » (`ExecutionList`), déplié quand il n'y a pas de résultat. Chaque en-tête montre un résumé et « Afficher » / « Masquer ».
- **Props** :
  - `backtest` : `result` (peut être null) et `executions`.
- **Source** : `src/features/backtest/result-details.tsx`.

### BacktestAssumptions

- **Import** : `import { BacktestAssumptions } from "@/features/backtest/assumptions"`.
- **Rôle** : liste « Hypothèses » d'un résultat, sans carte, en deux colonnes à partir de `sm` : période, devise (`BACKTEST_CURRENCY`), frais par ordre (achat et vente, D8), rebalancement (`rebalanceFrequencyLabels`), benchmark (`backtest.benchmarkSymbol`, `NO_BENCHMARK_LABEL` si null), taux sans risque du Sharpe (`result.riskFreeRate`, publié par l'engine), règle d'exécution, source et type de cours, date de récupération et empreinte des données (12 premiers caractères, valeur complète en `title`), puis `BACKTEST_DISCLAIMER`. `<Dash />` si `riskFreeRate`, `executionRule` ou `dataSource` est `null` (résultat antérieur). Libellés des données calculées ou des paramètres qui changent le calcul (frais, rebalancement, benchmark, taux sans risque, règle d’exécution, source, empreinte) en `InfoHint`.
- **Props** :
  - `backtest` : `startDate`, `endDate`, `feeRate` (fraction par ordre), `rebalanceFrequency` affichés.
  - `result` : `executionRule` et `dataSource` affichés.
- **Source** : `src/features/backtest/assumptions.tsx`.

### ExecutionList

- **Import** : `import { ExecutionList } from "@/features/backtest/execution-history"`.
- **Rôle** : lignes d'exécution, sans carte : tentative, statut, date, résumé ou cause d'échec, durée ; barre de progression pour une exécution active.
- **Props** :
  - `executions` : Plus récente d'abord.
- **Source** : `src/features/backtest/execution-history.tsx`.

### BacktestStats

- **Import** : `import { BacktestStats } from "@/features/backtest/stats"`.
- **Rôle** : 4 `StatCard` de la liste : total, en cours, terminés et échoués (avec taux `formatRate`), valeurs de `GET /api/backtest/stats` affichées telles quelles ; `Dash` pendant le chargement.
- **Props** :
  - `stats` : `useBacktestStats().data` ; `undefined` pendant le chargement.
- **Source** : `src/features/backtest/stats.tsx`.

### ResultMetrics

- **Import** : `import { ResultMetrics } from "@/features/backtest/result-metrics"`.
- **Rôle** : 3 `MetricBlock` d'un résultat, sur 2 colonnes à partir de `md` et 3 à partir de `xl` : « Performance » (CAGR, rendement total, valeur finale ; note : investissement unique et écart `dcaAdvantage` en DCA), « Risque » (volatilité, Sharpe avec `result.riskFreeRate` en description, max drawdown, récupération `formatRecovery` ; note : date du plus haut), « Coûts et activité » (frais payés, déduits de la valeur sur achats et ventes, ordres, rebalancements `rebalanceCount`). Avec `result.benchmark`, une colonne au symbole du benchmark affiche ses métriques. Tout est calculé par le moteur ; `<Dash />` si un champ manque (résultat antérieur).
- **Props** :
  - `result` : Résultat complet (ratios en fraction, montants en string).
  - `rebalanceFrequency` : Description du bloc « Coûts et activité ».
- **Source** : `src/features/backtest/result-metrics.tsx` (`PerformanceBlock` interne ; `RiskBlock` et `CostsBlock` dans `result-blocks.tsx`). Valeurs des lignes : [`features/backtest/metrics.tsx`](#featuresbacktestmetricstsx).

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

- **Import** : `import { BacktestCompare } from "@/features/backtest/backtest-compare"`.
- **Rôle** : écran comparaison (maquette 19 v2) : en-tête et « Copier le lien », `ComparisonSelection`, puis, avec deux backtests choisis, bandeau « Comparaison non homogène » si `homogeneous` est faux (une phrase par élément de `differences`), `ComparisonOverview`, `ComparisonMetrics` et `ComparisonParameters` (côte à côte à partir de `xl`). La sélection vit dans l'URL : `?ids=a,b` (`router.replace`), lien partageable ; un lien modifié à la main (`?ids=x,x`, plus de deux ids) est traité comme sans sélection, avec un message. Instancie `useBacktestComparison`.
- **Props** :
  - `ids` : Valeur brute du paramètre `ids` de l'URL : ids de A et B séparés par une virgule, un côté vide si non choisi.
- **Source** : `src/features/backtest/backtest-compare.tsx`.

### ComparisonSelection

- **Import** : `import { ComparisonSelection } from "@/features/backtest/comparison-selection"`.
- **Rôle** : carte de choix des backtests A et B parmi les `COMPARABLE_LIMIT` plus récents qui ont un résultat terminé, même relancés depuis (`useBacktests` avec `hasResult`), bouton « Échanger ». Un backtest choisi d'un côté n'est pas proposé de l'autre.
- **Props** :
  - `a` : Id de A, `""` si non choisi.
  - `b` : Id de B, `""` si non choisi.
  - `onChange` : Nouvelle paire (choix ou échange).
- **Source** : `src/features/backtest/comparison-selection.tsx`.

### ComparisonOverview

- **Import** : `import { ComparisonOverview } from "@/features/backtest/comparison-overview"`.
- **Rôle** : carte « Valeur des portefeuilles » : légende, valeurs de A et B (`comparisonSideColors`) et benchmark de A, sinon de B (`getComparisonBenchmark`), en pointillés (courbes alignées par `alignCurves`), puis drawdowns de A et B sur le même axe, via `ValueDrawdownCharts` ; drawdown masqué si aucun point n'en porte.
- **Props** :
  - `comparison` : Réponse de `GET /api/backtest/compare`.
- **Source** : `src/features/backtest/comparison-overview.tsx`.

### ComparisonMetrics, ComparisonParameters

- **Import** : `import { ComparisonMetrics } from "@/features/backtest/comparison-metrics"`, `import { ComparisonParameters } from "@/features/backtest/comparison-parameters"`.
- **Rôle** : deux `MetricBlock`. `ComparisonMetrics` : « Métriques comparées » (CAGR, rendement total, volatilité, Sharpe, max drawdown, récupération, valeur finale) en colonnes A, B, « Écart » (`deltas` de l'API, en points de ratio « ±x,x pts », Sharpe sans unité ; vert si favorable à A selon `comparedMetricHigherIsBetter`, rouge sinon ; `<Dash />` sans écart) et, si A (sinon B) a un benchmark (`getComparisonBenchmark`), son symbole. `ComparisonParameters` : « Paramètres » (période, mode, allocation, rebalancement, frais, benchmark) de A et B, badge « diffère » sur ceux de `differences`.
- **Props** (les deux) :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `comparison` | `BacktestComparison` | oui | — | Réponse de `GET /api/backtest/compare`. |

- **Source** : `src/features/backtest/comparison-metrics.tsx` (lignes construites depuis `metricHead`, écart coloré par `Delta`), `src/features/backtest/comparison-parameters.tsx`.

### `features/backtest/backtest-batch.tsx`

- **Import** : `import { BacktestBatchView } from "@/features/backtest/backtest-batch"`. Props : `batchId`. Page d'un lot de départs (maquette 32, `/app/backtest/batch/[batchId]`) : en-tête avec « Modifier les départs » et « Relancer le lot », `BatchStats`, tableau des résultats par date de départ, carte « Dates de départ » (`StartDates`, « Lancer le lot (N départs) » crée un nouveau lot) et `RollingWindows`. Valeurs telles que reçues de l'API.
- Sous-composants : `batch-stats.tsx` (`BatchStats({ batch })` : quatre cartes de synthèse), `rolling-windows.tsx` (`RollingWindows({ windows })` : onglets 1/3/5 ans, tableau, courbe du rendement annualisé avec la pire fenêtre marquée), `start-dates.tsx` (`StartDates({ dates, onChange, end, action? })` : Départ 1 à 10, refus sous le champ fautif, « Ajouter une date », compteur « n / 10 dates » ; aussi utilisé sous l'interrupteur du formulaire « Nouveau backtest »).

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

- **Import** : `import { useBacktestColumns, useHoldingColumns, useTradeColumns } from "@/features/backtest/column"`. Hooks (formats de la langue active) : à appeler dans le composant, puis `columns={columns}`.

| Export | Type | Colonnes |
| --- | --- | --- |
| `useBacktestColumns()` | `Column<Backtest>[]` | Nom, Stratégie, Allocation (`formatAllocation`, tronquée, texte complet en `title`), Période, Rendement (`totalReturn` × 100 via `ChangeCell`), CAGR (`cagr` du résumé × 100 via `ChangeCell`, `<Dash />` si non terminé ou résultat antérieur), Statut (badge), Durée. En-têtes Rendement, CAGR et Durée en `InfoHint`. |
| `useBatchColumns(endDate)` | `Column<BacktestBatch["rows"][number]>[]` | Départ, Durée (jusqu'à `endDate`), CAGR, Volatilité, Drawdown max, Valeur finale, Statut (« Meilleur » / « Pire » une fois le lot terminé) ; `<Dash />` sans résultat. |
| `useRollingColumns()` | `Column<RollingWindow>[]` | Durée (1, 3, 5 ans), Pire, Médiane, Meilleure, Part négative (rendements annualisés). |
| `useTradeColumns()` | `Column<Trade>[]` | Date, Symbole (`SymbolCell`), Côté (badge `tradeSideVariants`, « Achat » si `side` absent), Prix (2 décimales, sans devise), Quantité (jusqu'à 6 décimales), Montant et Frais (`formatPrice` en `BACKTEST_CURRENCY`) ; `Dash` si absents (résultats antérieurs). En-têtes Côté, Prix, Quantité, Montant, Frais en `InfoHint`. |
| `useHoldingColumns()` | `Column<Holding>[]` | Symbole (`SymbolCell`), Quantité (jusqu'à 6 décimales), Valeur au dernier cours (`formatPrice` en `BACKTEST_CURRENCY`). En-têtes Quantité et Valeur en `InfoHint`. |

Source : `src/features/backtest/column.tsx`.

### `features/backtest/types.ts`

- **Import** : `import type { Backtest, BacktestDetails, BacktestResult } from "@/features/backtest/types"`.
- Réponses de core-backend : `Decimal` → `string` (ratios en fraction), dates → `string` ISO. Les données du moteur et des contrats (`EquityPoint`, `Trade`, `Holding`, `Benchmark`, `LumpSumComparison`, `ExecutionRule`, `DataSource`, `BacktestPreview`, `BacktestComparison`…) sont **dérivées de `@trading-plateform/contracts`** (`import type`), unités dans `packages/contracts/src/backtest.ts`. Champs absents des résultats antérieurs : optionnels ou `null`, affichés `<Dash />`. Le détail de chaque type et de ses unités est en commentaire dans le fichier.
- Types propres au web : `Backtest` (liste), `BacktestDetails` (détail, `result` = dernier résultat terminé), `BacktestExecution`, `BacktestResult`, `AllocationInput` (saisie, poids en pourcent entier), `ExecutionStatus`, `InvestmentMode`, `RebalanceFrequency`, `BacktestListStats`.

Source : `src/features/backtest/types.ts`.

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

- **Import** : `import type { MarketAsset, Period } from "@/features/market/types"`. Réexport de `@trading-plateform/contracts` (`src/market.ts`), qui porte les unités.

| Export | Forme |
| --- | --- |
| `Period` | contrat : `"1d" \| "1w" \| "1m" \| "1y" \| "max"` |
| `MarketAsset` | contrat : `{ symbol; name; logoUrl?; price: number \| null; change24h: number \| null (pourcentage, 1,5 = +1,5 %); volume24h: number \| null; history: MarketDetails[] }` (`null` si le fournisseur n'a pas la valeur) |
| `MarketDetails` | contrat : `{ date: string (ISO datetime); price: number }` (intervalles sans clôture omis) |
| `MarketData` | contrat : `{ symbol; name; exchange; assetType; logoUrl? }` |

Source : `src/features/market/types.ts`.

## `features/settings`

Écran Paramètres (maquette `06.2`, onglet Apparence seul). Préférences d'affichage : ni route API ni base.

### SettingsTabs

- **Import** : `import { SettingsTabs } from "@/features/settings/settings-tabs"`.
- **Rôle** : barre d'onglets des paramètres (`ui/tabs`) ; l'onglet « Apparence » empile `ThemeCard` et `LanguageCard`. Un nouvel onglet = un `TabsTrigger` et son `TabsContent` ici.
- **Props** : aucune.
- **Exemple** (tiré de `src/app/app/settings/page.tsx`) :
  ```tsx
  <SettingsTabs />
  ```
- **Source** : `src/features/settings/settings-tabs.tsx`.

### SettingsCard

- **Import** : `import { SettingsCard } from "@/features/settings/settings-card"`.
- **Rôle** : carte d'un réglage (maquette `06.2`) : titre, description, puis le contrôle en `children` ; marges de 24 px, bordure et ombre légère (`Card` `compact` ajusté). Cadre commun à `ThemeCard` et `LanguageCard`.
- **Props** : `title` (string), `description` (string), `children` (`ReactNode`), tous requis.
- **Source** : `src/features/settings/settings-card.tsx`.

### ThemeCard

- **Import** : `import { ThemeCard } from "@/features/settings/theme-card"`.
- **Rôle** : carte « Thème » : trois aperçus Clair, Sombre, Système (`Button` variant `tile`), sur une colonne puis trois à partir de `sm`. Le clic applique le thème via next-themes, sans rechargement ; l'aperçu du thème actif est encadré (aucun avant l'hydratation, le thème venant du navigateur). Aperçus en couleurs fixes : ils montrent le thème représenté, pas le thème actif.
- **Props** : aucune.
- **Source** : `src/features/settings/theme-card.tsx`.

### LanguageCard

- **Import** : `import { LanguageCard } from "@/features/settings/language-card"`.
- **Rôle** : carte « Langue et région » : `OptionSelect` des langues de `i18n/config.ts` (nom de chaque langue dans sa propre langue). Le choix appelle `setLocale` : cookie `locale` écrit, page rendue dans la nouvelle langue sans perdre la session.
- **Props** : aucune.
- **Source** : `src/features/settings/language-card.tsx`.

## `i18n`

Langue de l'interface : cookie `locale`, jamais l'URL. Dictionnaires dans `messages/<langue>.json` (mêmes clés partout), lus par `useTranslations` / `getTranslations` de `next-intl`.

| Export | Import | Rôle |
| --- | --- | --- |
| `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `LOCALE_COOKIE`, `LOCALE_LABELS` | `@/i18n/config` | Langues disponibles (`fr`, `en`), langue par défaut (`fr`), nom du cookie, nom affiché de chaque langue. Ajouter une langue : son code ici, son libellé, son fichier `messages/<code>.json`. |
| `setLocale(locale)` | `@/i18n/actions` | Server Action : écrit le cookie (un an) ; valeur inconnue ignorée. |
| (défaut) | `src/i18n/request.ts` | Configuration `next-intl` par requête : langue du cookie, sinon `DEFAULT_LOCALE`. Branchée par `next.config.ts`. |

Source : `src/i18n/`.
