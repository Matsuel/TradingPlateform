# Catalogue web (apps/web)

Catalogue de ce que le web expose pour être réutilisé : composants partagés de `src/components/`, champs de formulaire, formatters et helpers de `src/lib/`, exports publics de chaque `src/features/<domaine>/`. Lis-le avant d'utiliser ou de créer un composant. Toute création, modification ou suppression d'un élément catalogué met à jour son entrée **dans le même diff que le code**, selon les gabarits ci-dessous. En cas d'écart, le code fait foi : corrige l'entrée.

## Gabarits

Composant :

````markdown
### NomDuComposant

- **Import** : `import { NomDuComposant } from "@/components/..."` (ou `default`).
- **Rôle** : une phrase, quand l'utiliser.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `prop` | `string` | oui | — | … (unité si nombre) |

- **Exemple** (tiré de `chemin/du/fichier.tsx`) :
  ```tsx
  <NomDuComposant prop="…" />
  ```
- **Utilisé par** : `chemin/a.tsx`, `chemin/b.tsx` | aucun.
- **Source** : `src/components/....tsx`.
````

Module de fonctions, hooks, constantes ou types (`lib/*.ts`, `features/<domaine>/api.ts`, `hook.ts`, `constants.ts`…) :

````markdown
### `chemin/fichier.ts`

- **Import** : `import { a, b } from "@/…/fichier"`.

| Export | Signature / valeur | Rôle (et unité) | Utilisé par |
| --- | --- | --- | --- |
| `a` | `(v: number) => string` | … | `chemin/x.tsx` |
````

## Sommaire

- [`components/ui`](#componentsui)
- [Mise en page et navigation](#mise-en-page-et-navigation) : `PageLayout`, `PageHeader`, `Header`, `AppSidebar`, `SidebarNav`, `NavUser`, `AppSheet`
- [Données et tableaux](#données-et-tableaux) : `DataTable` (`Column`), `SymbolCell`, `ChangeCell`, `Dash`, `FilterTabs`, `StatCard`
- [Graphiques](#graphiques) : `PriceAreaChart` (`PricePoint`), `Sparkline`
- [Symboles](#symboles) : `SymbolPicker`
- [Formulaires (`components/form`)](#formulaires-componentsform) : `AppField`, `TextField`, `NumberField`, `TextareaField`, `SelectField`, `DateField`, `CheckboxField`, `SwitchField`, `SymbolsField`, `FormSection`, `FieldRow`
- [`lib`](#lib) : `format.ts`, `api.ts`, `path.ts`, `utils.ts`, `auth.ts`, `session.ts`
- [`features/auth`](#featuresauth)
- [`features/backtest`](#featuresbacktest)
- [`features/market`](#featuresmarket)

## `components/ui`

Primitives shadcn (base-ui), voir la doc shadcn. Ne les modifie qu'en cas de besoin réel.

## Mise en page et navigation

### PageLayout

- **Import** : `import PageLayout from "@/components/page-layout"`.
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
- **Utilisé par** : toutes les pages de `src/app/app/` (`page.tsx`, `backtest/`, `backtest/new/`, `backtest/[id]/`, `market/`, `market/[symbol]/`, `settings/`, `(admin)/users/`, `(admin)/monitoring/`).
- **Source** : `src/components/page-layout/index.tsx`.

### PageHeader

- **Import** : `import PageHeader from "@/components/page-layout/header"`.
- **Rôle** : en-tête de page : titre, badge, description, élément de tête et actions à droite.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `title` | `string` | non | — | Titre `h2` ; sans titre, `badge` n'est pas affiché. |
  | `badge` | `ReactNode` | non | — | À droite du titre (ex. statut). |
  | `description` | `string` | non | — | Sous le titre. |
  | `leading` | `ReactNode` | non | — | Avant le bloc titre (ex. `SymbolCell size="lg"`). |
  | `actions` | `ReactNode` | non | — | Boutons à droite. |
  | `className` | `string` | non | — | Sur le conteneur. Les autres attributs HTML du type sont acceptés mais ignorés. |

- **Exemple** (tiré de `src/features/backtest/backtest-detail.tsx`) :
  ```tsx
  <PageHeader
      title={backtest.name}
      badge={execution && <Badge variant={statusBadges[execution.status].variant}>{statusBadges[execution.status].label}</Badge>}
      description={describe(backtest)}
      actions={<Button onClick={() => rerun.mutate()} disabled={!canRerun}>Relancer</Button>}
  />
  ```
- **Utilisé par** : les pages de `src/app/app/` sauf `backtest/[id]` et `market/[symbol]` ; `src/features/backtest/backtest-detail.tsx`, `src/features/market/symbol-detail.tsx`.
- **Source** : `src/components/page-layout/header.tsx`.

### Header

- **Import** : `import Header from "@/components/Header"`.
- **Rôle** : barre du haut de l'espace `/app` : bouton de repli de la sidebar et fil d'Ariane calculé par `getActive(usePathname())`.
- **Props** : aucune.
- **Exemple** (tiré de `src/app/app/layout.tsx`) :
  ```tsx
  <SidebarInset>
      <Header />
      {children}
  </SidebarInset>
  ```
- **Utilisé par** : `src/app/app/layout.tsx`.
- **Source** : `src/components/Header.tsx`.

### AppSidebar

- **Import** : `import { AppSidebar } from "@/components/app-sidebar"`.
- **Rôle** : sidebar de l'espace `/app` : sections de `constants/sidebar.tsx` (les sections `adminOnly` seulement si `isAdmin`) et menu utilisateur.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `user` | `User` (better-auth) | oui | — | Utilisateur de la session, passé à `NavUser`. |
  | `isAdmin` | `boolean` | oui | — | Affiche les sections `adminOnly`. |
  | `...props` | `React.ComponentProps<typeof Sidebar>` | non | — | Transmises à `Sidebar` (`collapsible="icon"` fixé). |

- **Exemple** (tiré de `src/app/app/layout.tsx`) :
  ```tsx
  <AppSidebar user={session.user} isAdmin={admin} />
  ```
- **Utilisé par** : `src/app/app/layout.tsx`.
- **Source** : `src/components/app-sidebar.tsx`.

### SidebarNav

- **Import** : `import SidebarNav from "@/components/SidebarNav"`.
- **Rôle** : un groupe d'onglets de la sidebar ; l'onglet actif est déterminé par `findActive(usePathname())`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `name` | `string` | oui | — | Libellé du groupe. |
  | `tabs` | `{ name: string; url: string; icon: React.ReactNode }[]` | oui | — | Onglets du groupe. |

- **Exemple** (tiré de `src/components/app-sidebar.tsx`) :
  ```tsx
  <SidebarNav tabs={parts.tabs} name={parts.name} key={parts.name} />
  ```
- **Utilisé par** : `src/components/app-sidebar.tsx`.
- **Source** : `src/components/SidebarNav.tsx`.

### NavUser

- **Import** : `import { NavUser } from "@/components/nav-user"`.
- **Rôle** : menu utilisateur en pied de sidebar : avatar, lien `/app/settings`, déconnexion (`signOut` puis `/login`).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `user` | `User` (better-auth) | oui | — | Nom, email, image affichés. |

- **Exemple** (tiré de `src/components/app-sidebar.tsx`) :
  ```tsx
  <NavUser user={user} />
  ```
- **Utilisé par** : `src/components/app-sidebar.tsx`.
- **Source** : `src/components/nav-user.tsx`.

### AppSheet

- **Import** : `import AppSheet from "@/components/app-sheet/app-sheet"`.
- **Rôle** : panneau latéral droit ouvert par un déclencheur, avec titre et description.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `trigger` | `ReactElement` | oui | — | Élément rendu comme déclencheur (`SheetTrigger render`). |
  | `title` | `ReactNode` | oui | — | Titre du panneau. |
  | `description` | `ReactNode` | non | — | Sous le titre. |
  | `children` | `ReactNode` | non | — | Contenu. |
  | `className` | `string` | non | — | Sur `SheetContent`. |
  | `open` | `boolean` | non | — | Mode contrôlé. |
  | `onOpenChange` | `(open: boolean) => void` | non | — | Mode contrôlé. |

- **Exemple** (tiré de `src/features/market/symbol-sheet.tsx`) :
  ```tsx
  <AppSheet title={symbol} trigger={<Button size="lg">Acheter</Button>}>
      <Tabs defaultValue="trade" className="flex-1 px-4 pb-4">…</Tabs>
  </AppSheet>
  ```
- **Utilisé par** : `src/features/market/symbol-sheet.tsx`.
- **Source** : `src/components/app-sheet/app-sheet.tsx`.

## Données et tableaux

### DataTable

- **Import** : `import { DataTable, type Column } from "@/components/data-table/data-table"`.
- **Rôle** : tableau branché sur une requête TanStack Query : gère chargement, erreur (bouton « Réessayer »), vide et clic de ligne. Colonnes déclarées dans `features/<domaine>/column.tsx`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `query` | `Pick<UseQueryResult<T[], Error>, "data" \| "isPending" \| "isError" \| "error"> & { refetch: () => unknown }` | oui | — | Résultat de hook ; pour filtrer, passer `{ ...query, data }`. |
  | `columns` | `Column<T>[]` | oui | — | Colonnes. |
  | `rowKey` | `(row: T) => string` | oui | — | Clé React de ligne. |
  | `onRowClick` | `(row: T) => void` | non | — | Rend les lignes cliquables. |
  | `emptyMessage` | `ReactNode` | non | `"Aucune donnée."` | Affiché si `data` est vide. |
  | `loader` | `ReactNode` | non | spinner `Loader2` | Affiché si `isPending`. |
  | `title` | `ReactNode` | non | — | Titre au-dessus du tableau. |
  | `description` | `ReactNode` | non | — | Sous le titre. |
  | `actions` | `ReactNode` | non | — | À droite du titre (ex. `FilterTabs`). |
  | `className` | `string` | non | — | Sur l'élément `Table` (pas le cadre). |

  `Column<T>` : `{ header: ReactNode; cell: (row: T) => ReactNode; className?: string }` (`className` appliquée à l'en-tête et aux cellules).

- **Exemple** (tiré de `src/features/backtest/backtest-list.tsx`) :
  ```tsx
  <DataTable
      query={{ ...query, data }}
      columns={backtestColumns}
      rowKey={(b) => b.id}
      onRowClick={(b) => router.push(`${prefix}/backtest/${b.id}`)}
      title="Tous les backtests"
      description="Triés par date de lancement"
      actions={<FilterTabs value={filter} onChange={setFilter} options={filterOptions} />}
      emptyMessage="Aucun backtest."
  />
  ```
- **Utilisé par** : `src/features/market/market-list.tsx`, `src/features/backtest/backtest-list.tsx`, `src/features/backtest/backtest-detail.tsx` ; `Column` par `src/features/backtest/column.tsx`, `src/features/market/column.tsx`.
- **Source** : `src/components/data-table/data-table.tsx`.

### SymbolCell

- **Import** : `import { SymbolCell } from "@/components/data-table/cells"`.
- **Rôle** : logo (ou initiale) + symbole + nom, en cellule de tableau (`md`) ou en tête de page (`lg`).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `symbol` | `string` | oui | — | Ticker affiché ; sa 1re lettre sert de repli au logo. |
  | `name` | `string` | non | — | Nom sous le symbole. |
  | `logoUrl` | `string` | non | — | Image de l'avatar. |
  | `size` | `"md" \| "lg"` | non | `"md"` | `md` : avatar 32 px ; `lg` : 48 px, symbole en `text-h2`. |
  | `className` | `string` | non | — | Sur le conteneur. |

- **Exemple** (tiré de `src/features/market/column.tsx`) :
  ```tsx
  { header: "Symbole", cell: (a) => <SymbolCell symbol={a.symbol} name={a.name} logoUrl={a.logoUrl} /> }
  ```
- **Utilisé par** : `src/features/market/column.tsx`, `src/features/backtest/column.tsx`, `src/features/market/symbol-detail.tsx`.
- **Source** : `src/components/data-table/cells.tsx`.

### ChangeCell

- **Import** : `import { ChangeCell } from "@/components/data-table/cells"`.
- **Rôle** : variation signée suivie de « % », verte si ≥ 0, rouge sinon.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `value` | `number` | oui | — | **Pourcentage** (`1.5` → « +1,50 % ») ; un ratio doit être multiplié par 100 avant (ou utiliser `formatRatio` hors tableau). |

- **Exemple** (tiré de `src/features/backtest/column.tsx`) :
  ```tsx
  return value == null ? <Dash /> : <ChangeCell value={Number(value) * 100} />
  ```
- **Utilisé par** : `src/features/backtest/column.tsx`, `src/features/market/column.tsx`.
- **Source** : `src/components/data-table/cells.tsx`.

### Dash

- **Import** : `import Dash from "@/components/custom/Dash"`.
- **Rôle** : tiret « — » atténué pour une valeur absente.
- **Props** : aucune.
- **Exemple** (tiré de `src/features/backtest/column.tsx`) :
  ```tsx
  if (!e) return <Dash />
  ```
- **Utilisé par** : `src/features/backtest/column.tsx`, `src/features/backtest/stats.tsx`.
- **Source** : `src/components/custom/Dash.tsx`.

### FilterTabs

- **Import** : `import { FilterTabs } from "@/components/filter-tabs"`.
- **Rôle** : onglets de filtre contrôlés, typés par l'union des valeurs.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `value` | `T extends string` | oui | — | Onglet actif. |
  | `onChange` | `(value: T) => void` | oui | — | Changement d'onglet. |
  | `options` | `{ value: T; label: string }[]` | oui | — | Onglets. |
  | `className` | `string` | non | — | Sur `Tabs`. |

- **Exemple** (tiré de `src/features/backtest/backtest-list.tsx`) :
  ```tsx
  <FilterTabs value={filter} onChange={setFilter} options={filterOptions} />
  ```
- **Utilisé par** : `src/features/backtest/backtest-list.tsx`.
- **Source** : `src/components/filter-tabs.tsx`.

### StatCard

- **Import** : `import { StatCard } from "@/components/stat-card"`.
- **Rôle** : carte de métrique : libellé, valeur, badge de tendance optionnel et légende. Groupes de cartes dans `features/<domaine>/stats.tsx`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `label` | `string` | oui | — | Libellé. |
  | `value` | `ReactNode` | oui | — | Valeur déjà formatée. |
  | `caption` | `ReactNode` | non | — | Légende ; masquée si falsy. |
  | `delta` | `ReactNode` | non | — | Contenu du badge ; badge masqué si `null`/`undefined`. |
  | `trend` | `"up" \| "down" \| "neutral"` | non | `"neutral"` | Style et icône du badge (`up` vert, `down` rouge). |
  | `className` | `string` | non | — | Sur la carte. |

- **Exemple** (tiré de `src/features/backtest/stats.tsx`) :
  ```tsx
  <StatCard label="Terminés" value={completed} caption="Taux de réussite" delta={rate(completed)} trend="up" />
  ```
- **Utilisé par** : `src/features/backtest/stats.tsx`.
- **Source** : `src/components/stat-card.tsx`.

## Graphiques

### PriceAreaChart

- **Import** : `import { PriceAreaChart, type PricePoint } from "@/components/chart"`.
- **Rôle** : courbe d'aire d'une série `PricePoint`, verte ou rouge ; l'appelant fournit la devise et les formats de date.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `data` | `PricePoint[]` = `{ date: string; price: number }[]` | oui | — | Points, `date` ISO ou `YYYY-MM-DD`. |
  | `formatTick` | `(date: string) => string` | oui | — | Libellés de l'axe X. |
  | `formatTooltipDate` | `(date: string) => string` | oui | — | Date de l'infobulle. |
  | `currency` | `string` | oui | — | Code ISO passé à `formatPrice` dans l'infobulle (`BACKTEST_CURRENCY`, `MARKET_CURRENCY`). |
  | `label` | `string` | non | `"Prix"` | Nom de la série. |
  | `positive` | `boolean` | non | dernier point ≥ premier | Couleur verte si vrai. |
  | `className` | `string` | non | — | Sur `ChartContainer` (hauteur par défaut `h-82.5`). |

- **Exemple** (tiré de `src/features/backtest/equity-chart.tsx`) :
  ```tsx
  <PriceAreaChart
      data={data.map((p) => ({ date: p.date, price: p.value }))}
      formatTick={formatTick}
      formatTooltipDate={formatTooltipDate}
      label="Valeur"
      currency={BACKTEST_CURRENCY}
      positive={positive}
  />
  ```
- **Utilisé par** : `src/features/backtest/equity-chart.tsx`, `src/features/market/price-chart.tsx` ; `PricePoint` par `src/components/sparkline.tsx`.
- **Source** : `src/components/chart.tsx`.

### Sparkline

- **Import** : `import { Sparkline } from "@/components/sparkline"`.
- **Rôle** : mini-courbe sans axe pour une colonne « Tendance ».
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `data` | `PricePoint[]` (`@/components/chart`) | oui | — | Points `{ date, price }`. |
  | `positive` | `boolean` | oui | — | Vert si vrai, rouge sinon. |
  | `className` | `string` | non | `"h-8 w-30"` | Remplace la taille par défaut. |

- **Exemple** (tiré de `src/features/market/column.tsx`) :
  ```tsx
  { header: "Tendance", cell: (a) => <Sparkline data={a.history} positive={a.change24h >= 0} /> }
  ```
- **Utilisé par** : `src/features/market/column.tsx`.
- **Source** : `src/components/sparkline.tsx`.

## Symboles

### SymbolPicker

- **Import** : `import { SymbolPicker } from "@/components/symbol-picker"`.
- **Rôle** : dialogue de recherche de symbole (`useMarketSearch`, au moins `MIN_SEARCH_LENGTH` = 3 caractères, anti-rebond 500 ms) ; se ferme à la sélection.
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
- **Utilisé par** : `src/features/market/symbol-search.tsx`, `src/components/form/fields/symbols-field.tsx`.
- **Source** : `src/components/symbol-picker.tsx`.

## Formulaires (`components/form`)

Tous les champs se placent sous un `FormProvider` de react-hook-form (ils lisent `useFormContext`) et affichent eux-mêmes libellé, description et erreur zod. `@/components/form` exporte les champs de `fields/index.ts` plus `FormSection` et `FieldRow` ; `AppField` s'importe de `@/components/form/field`.

Props communes `BaseProps<T>` (exportées par `field.tsx`), répétées dans chaque champ :

| Nom | Type | Requis | Défaut | Description |
| --- | --- | --- | --- | --- |
| `name` | `FieldPath<T>` | oui | — | Chemin du champ dans le formulaire. |
| `label` | `string` | non | — | Libellé. |
| `description` | `string` | non | — | Aide sous le contrôle. |
| `className` | `string` | non | — | Sur le `Field`. |

### AppField

- **Import** : `import { AppField, type BaseProps, type RenderCtx } from "@/components/form/field"`.
- **Rôle** : base de tous les champs : relie un contrôle à react-hook-form et gère libellé/description/erreur. À utiliser pour créer un nouveau type de champ dans `fields/`.
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
- **Utilisé par** : les 8 fichiers de `src/components/form/fields/`.
- **Source** : `src/components/form/field.tsx`.

### TextField

- **Import** : `import { TextField } from "@/components/form"`.
- **Rôle** : saisie texte d'une valeur `string`.
- **Props** : `BaseProps<T>` + `type` (`"text" | "email" | "password"`, non requis, défaut `"text"`), `placeholder` (`string`, non requis).
- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <TextField name="name" label="Nom du backtest" />
  ```
- **Utilisé par** : `src/features/backtest/sections.tsx`, `src/features/auth/login-form.tsx`, `src/features/auth/register-form.tsx`.
- **Source** : `src/components/form/fields/text-field.tsx`.

### NumberField

- **Import** : `import { NumberField } from "@/components/form"`.
- **Rôle** : saisie d'un `number` ; un champ vide vaut `undefined` (le schéma zod signale « Requis »).
- **Props** : `BaseProps<T>` + `placeholder` (`string`, non requis). L'unité se met dans `label`.
- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <NumberField name="fee" label="Frais par ordre (%)" />
  ```
- **Utilisé par** : `src/features/backtest/sections.tsx`, `src/features/backtest/quick-backtest-form.tsx`.
- **Source** : `src/components/form/fields/number-field.tsx`.

### TextareaField

- **Import** : `import { TextareaField } from "@/components/form"`.
- **Rôle** : saisie texte multiligne d'une valeur `string`.
- **Props** : `BaseProps<T>` + `rows` (`number`, non requis), `placeholder` (`string`, non requis).
- **Exemple** (aucun usage dans le dépôt) :
  ```tsx
  <TextareaField name="notes" label="Notes" rows={4} />
  ```
- **Utilisé par** : aucun.
- **Source** : `src/components/form/fields/textarea-field.tsx`.

### SelectField

- **Import** : `import { SelectField } from "@/components/form"`.
- **Rôle** : choix d'une valeur `string` parmi des options ; une valeur effacée devient `""`.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `options` | `{ value: string; label: string }[]` | oui | — | Options (ex. `strategyOptions`). |
  | `placeholder` | `string` | non | `"Sélectionner…"` | Sans valeur. |

- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <SelectField name="strategy" label="Stratégie" options={strategyOptions} />
  ```
- **Utilisé par** : `src/features/backtest/sections.tsx`, `src/features/backtest/quick-backtest-form.tsx`.
- **Source** : `src/components/form/fields/select-field.tsx`.

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
- **Utilisé par** : `src/features/backtest/sections.tsx`, `src/features/backtest/quick-backtest-form.tsx`.
- **Source** : `src/components/form/fields/date-field.tsx`.

### CheckboxField

- **Import** : `import { CheckboxField } from "@/components/form"`.
- **Rôle** : case à cocher d'une valeur `boolean`, texte à droite.
- **Props** : `BaseProps<T>` seules.
- **Exemple** (aucun usage dans le dépôt) :
  ```tsx
  <CheckboxField name="accept" label="J'accepte les conditions" />
  ```
- **Utilisé par** : aucun.
- **Source** : `src/components/form/fields/checkbox-field.tsx`.

### SwitchField

- **Import** : `import { SwitchField } from "@/components/form"`.
- **Rôle** : interrupteur d'une valeur `boolean`, texte à gauche et contrôle à droite.
- **Props** : `BaseProps<T>` seules.
- **Exemple** (aucun usage dans le dépôt) :
  ```tsx
  <SwitchField name="notifications" label="Notifications" description="Recevoir un email à la fin du calcul" />
  ```
- **Utilisé par** : aucun.
- **Source** : `src/components/form/fields/switch-field.tsx`.

### SymbolsField

- **Import** : `import { SymbolsField } from "@/components/form"`.
- **Rôle** : liste de symboles (`string[]`) en chips, ajout via `SymbolPicker`, retrait par la croix.
- **Props** : `BaseProps<T>` +

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `max` | `number` | non | — | Nombre maximal ; bouton d'ajout désactivé une fois atteint. |
  | `addLabel` | `string` | non | `"Ajouter"` | Libellé du bouton d'ajout. |

- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <SymbolsField name="symbols" label="Symboles" />
  ```
- **Utilisé par** : `src/features/backtest/sections.tsx`.
- **Source** : `src/components/form/fields/symbols-field.tsx`.

### FormSection

- **Import** : `import { FormSection } from "@/components/form"`.
- **Rôle** : carte titrée qui regroupe des champs (grille `gap-4`).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `title` | `string` | oui | — | Titre de la carte. |
  | `description` | `string` | non | — | Sous le titre. |
  | `className` | `string` | non | — | Sur la carte. |
  | `children` | `React.ReactNode` | oui | — | Champs. |

- **Exemple** (tiré de `src/features/backtest/sections.tsx`) :
  ```tsx
  <FormSection title="Général" description="Nom et stratégie à tester">
      <TextField name="name" label="Nom du backtest" />
      <SelectField name="strategy" label="Stratégie" options={strategyOptions} />
  </FormSection>
  ```
- **Utilisé par** : `src/features/backtest/sections.tsx`, `src/features/auth/login-form.tsx`, `src/features/auth/register-form.tsx`.
- **Source** : `src/components/form/layout.tsx`.

### FieldRow

- **Import** : `import { FieldRow } from "@/components/form"`.
- **Rôle** : place des champs côte à côte (2 colonnes à partir de `sm`).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `children` | `React.ReactNode` | oui | — | Champs. |
  | `className` | `string` | non | — | Sur la grille. |

- **Exemple** (tiré de `src/features/backtest/quick-backtest-form.tsx`) :
  ```tsx
  <FieldRow>
      <NumberField name="amount" label={strategy === "lump_sum" ? "Capital initial (€)" : "Montant mensuel (€)"} />
      <NumberField name="fee" label="Frais par ordre (%)" />
  </FieldRow>
  ```
- **Utilisé par** : `src/features/backtest/sections.tsx`, `src/features/backtest/quick-backtest-form.tsx`.
- **Source** : `src/components/form/layout.tsx`.

## `lib`

### `lib/format.ts`

- **Import** : `import { formatPrice, formatRatio } from "@/lib/format"`.
- Tous en locale `LOCALE` (`fr-FR`). Seul `formatRatio` convertit une unité (fraction → pourcentage).

| Export | Signature / valeur | Rôle (et unité) | Utilisé par |
| --- | --- | --- | --- |
| `LOCALE` | `"fr-FR"` | Locale des formats `Intl` locaux à un composant (ticks de graphique). | `components/chart.tsx`, `features/backtest/equity-chart.tsx`, `features/market/price-chart.tsx` |
| `formatPrice` | `(v: number, currency: string) => string` | Montant dans la devise ISO **obligatoire** : `formatPrice(1234.5, "EUR")` → « 1 234,50 € ». | `components/chart.tsx`, `features/market/column.tsx`, `features/backtest/stats.tsx` |
| `formatChange` | `(v: number) => string` | Nombre signé, 2 décimales, sans « % » : `1.5` → « +1,50 ». Pour un pourcentage déjà en %. | `components/data-table/cells.tsx`, `formatRatio` |
| `formatRatio` | `(ratio: number) => string` | Ratio en **fraction** → variation signée en % : `0.342` → « +34,20 % ». | `features/backtest/stats.tsx`, `features/backtest/execution-history.tsx` |
| `formatNumber` | `(v: number) => string` | Nombre à 2 décimales : « 268,50 ». | `features/backtest/column.tsx` |
| `formatVolume` | `(v: number) => string` | Notation compacte : `41234567` → « 41,23 M ». | `features/market/column.tsx` |
| `formatDate` | `(d: string \| Date) => string` | Date et heure courtes : « 28/10/2026 09:00 ». | `features/backtest/execution-history.tsx` |
| `formatDay` | `(d: string \| Date) => string` | Jour court : « 28/10/26 ». | `features/backtest/column.tsx`, `features/backtest/stats.tsx` |
| `formatDayRange` | `(start: string \| Date, end: string \| Date) => string` | Période : « 28/10/25 – 28/10/26 ». | `features/backtest/column.tsx`, `features/backtest/backtest-detail.tsx` |

Source : `src/lib/format.ts`.

### `lib/api.ts`

- **Import** : `import { apiFetch } from "@/lib/api"`.

| Export | Signature | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `apiFetch` | `<T>(path: string, init?: RequestInit) => Promise<T>` | Seul point d'appel HTTP : préfixe `path` par `NEXT_PUBLIC_API_URL` (`http://localhost:8000/api`), envoie les cookies, ajoute `Accept: application/json`. Statut non 2xx → `Error("Erreur API : <status> <statusText>")` (corps ignoré). Routes : `apps/core-backend/API.md`. | `features/backtest/api.ts`, `features/market/api.ts` |

Source : `src/lib/api.ts`.

### `lib/path.ts`

- **Import** : `import { prefix, authPaths, getActive } from "@/lib/path"`.

| Export | Signature / valeur | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `prefix` | `"/app"` (défini dans `constants/sidebar.tsx`, ré-exporté ici) | Préfixe des routes de l'espace connecté : `` `${prefix}/backtest/${id}` ``. Importer depuis `@/lib/path`. | `app/not-found.tsx`, `app/app/backtest/page.tsx`, `app/app/(admin)/layout.tsx`, `components/nav-user.tsx`, `features/auth/*`, `features/backtest/backtest-list.tsx`, `new-backtest-form.tsx`, `quick-backtest-form.tsx`, `features/market/market-list.tsx`, `symbol-search.tsx` |
| `authPaths` | `{ login: "/login", register: "/register" }` | Pages publiques d'authentification. `proxy.ts` garde ses littéraux (son `matcher` doit être statique). | `features/auth/*`, `components/nav-user.tsx`, `lib/session.ts` |
| `findActive` | `(pathname: string) => { name, url, icon, group } \| undefined` | Onglet de `constants/sidebar.tsx` le plus spécifique qui correspond au chemin. | `components/SidebarNav.tsx` |
| `getActive` | `(pathname: string) => { parent: string \| null; name: string \| null; url: string \| null }` | Groupe, nom et URL de l'onglet actif (fil d'Ariane). | `components/Header.tsx` |

Source : `src/lib/path.ts`.

### `lib/utils.ts`

- **Import** : `import { cn } from "@/lib/utils"`.

| Export | Signature | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `cn` | `(...classes) => string` (réexport du paquet `cn`) | Compose et fusionne des classes Tailwind conditionnelles. | `components/*` hors `ui/` (chart, stat-card, page-layout, data-table, form), `features/backtest/execution-history.tsx`, `features/market/price-chart.tsx`, `app/layout.tsx` ; les primitives `ui/` importent `cn` directement depuis `"cn"`. |

Source : `src/lib/utils.ts`.

### `lib/auth.ts`

- **Import** : `import { authClient } from "@/lib/auth"`. Routes : `ALL /api/auth/{*path}` dans `apps/core-backend/API.md`.

| Export | Signature / valeur | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `authClient` | client better-auth/react (`baseURL: "http://localhost:8000"`, plugin `adminClient`) | Session côté serveur. | `lib/session.ts` |
| `signIn`, `signUp`, `signOut`, `useSession` | méthodes déstructurées de `authClient` | `signIn`/`signUp` ne s'appellent que via `features/auth/api.ts` ; `useSession` n'est pas utilisé. | `features/auth/api.ts` (`signIn`, `signUp`), `components/nav-user.tsx` (`signOut`) |

Source : `src/lib/auth.ts`.

### `lib/session.ts`

- **Import** : `import { requireSession } from "@/lib/session"`. Serveur uniquement (`server-only`).

| Export | Signature | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `getSession` | `() => Promise<{ session, user } \| null>` (mis en cache par requête) | Session courante lue depuis le cookie entrant. | `requireSession`, `isAdmin` |
| `requireSession` | `() => Promise<{ session, user }>` | Session ou redirection vers `authPaths.login`. | `app/app/layout.tsx`, `app/app/(admin)/layout.tsx` |
| `isAdmin` | `() => Promise<boolean>` | La session a le rôle `admin`. | `app/app/(admin)/layout.tsx` |
| `hasAdminRole` | `(role?: string \| null) => boolean` | `role` (liste séparée par des virgules) contient `admin`. | `app/app/layout.tsx`, `isAdmin` |

Source : `src/lib/session.ts`.

## `features/auth`

Écrans : `LoginForm`, `RegisterForm`. Données : `api.ts`, `hook.ts`, `schema.ts`. Même forme que `features/backtest` : react-hook-form + schéma zod + champs de `components/form`.

### LoginForm

- **Import** : `import { LoginForm } from "@/features/auth/login-form"`.
- **Rôle** : formulaire de connexion (email + mot de passe) dans une `FormSection` ; valide avec `loginSchema`, appelle `useLogin`, puis redirige vers `prefix` et rafraîchit la session serveur. L'erreur better-auth s'affiche sous les champs ; lien vers `authPaths.register`.
- **Props** : aucune.
- **Exemple** (tiré de `src/app/(auth)/login/page.tsx`) :
  ```tsx
  <div className="flex flex-col gap-6">
      <LoginForm />
  </div>
  ```
- **Utilisé par** : `src/app/(auth)/login/page.tsx`.
- **Source** : `src/features/auth/login-form.tsx`.

### RegisterForm

- **Import** : `import { RegisterForm } from "@/features/auth/register-form"`.
- **Rôle** : formulaire d'inscription (nom + email + mot de passe) dans une `FormSection` ; valide avec `registerSchema`, appelle `useRegister`, puis redirige vers `prefix`. Lien vers `authPaths.login`.
- **Props** : aucune.
- **Exemple** (tiré de `src/app/(auth)/register/page.tsx`) :
  ```tsx
  <RegisterForm />
  ```
- **Utilisé par** : `src/app/(auth)/register/page.tsx`.
- **Source** : `src/features/auth/register-form.tsx`.

### `features/auth/api.ts`

- **Import** : `import { login } from "@/features/auth/api"`. Appeler via les hooks plutôt que directement.
- Les routes d'auth passent par le client better-auth (`signIn`/`signUp` de `lib/auth.ts`, cookies de session), pas par `apiFetch`. Une erreur better-auth est relancée en `Error(message)`.

| Export | Signature | Route (`apps/core-backend/API.md`) | Utilisé par |
| --- | --- | --- | --- |
| `login` | `(values: LoginValues) => Promise<void>` ; erreur → `Error(message ?? "Identifiants invalides")` | `ALL /api/auth/{*path}` (`sign-in/email`) | `useLogin` |
| `register` | `(values: RegisterValues) => Promise<void>` ; erreur → `Error(message ?? "Inscription impossible")` | `ALL /api/auth/{*path}` (`sign-up/email`) | `useRegister` |

Source : `src/features/auth/api.ts`.

### `features/auth/hook.ts`

- **Import** : `import { useLogin } from "@/features/auth/hook"`.

| Export | Signature | Clé / comportement | Utilisé par |
| --- | --- | --- | --- |
| `useLogin` | `() => UseMutationResult<void, Error, LoginValues>` | Mutation sans invalidation ; la redirection et `router.refresh()` sont faites par le formulaire. | `login-form.tsx` |
| `useRegister` | `() => UseMutationResult<void, Error, RegisterValues>` | Idem. | `register-form.tsx` |

Source : `src/features/auth/hook.ts`.

### `features/auth/schema.ts`

- **Import** : `import { loginSchema, type LoginValues } from "@/features/auth/schema"`.

| Export | Valeur | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `loginSchema` / `LoginValues` | `{ email: email valide, password: string non vide }` | Connexion : le serveur juge le mot de passe. | `login-form.tsx`, `api.ts` |
| `registerSchema` / `RegisterValues` | `{ name: string non vide (trim), email: email valide, password: 8 à 128 caractères }` | Inscription : bornes = défauts `emailAndPassword` de better-auth côté core-backend. | `register-form.tsx`, `api.ts` |

Source : `src/features/auth/schema.ts`.

## `features/backtest`

Écrans et sections : composants ci-dessous. Données : modules `api.ts`, `hook.ts`, `schema.ts`, `constants.ts`, `utils.ts`, `column.tsx`, `types.ts`.

### BacktestList

- **Import** : `import { BacktestList } from "@/features/backtest/backtest-list"`.
- **Rôle** : écran liste : `BacktestStats` puis `DataTable` des backtests filtrable par statut ; clic → détail.
- **Props** : aucune.
- **Exemple** (tiré de `src/app/app/backtest/page.tsx`) :
  ```tsx
  <BacktestList />
  ```
- **Utilisé par** : `src/app/app/backtest/page.tsx`.
- **Source** : `src/features/backtest/backtest-list.tsx`.

### BacktestDetail

- **Import** : `import { BacktestDetail } from "@/features/backtest/backtest-detail"`.
- **Rôle** : écran détail : en-tête avec statut et relance, métriques, courbe d'equity, ordres, historique d'exécution. Instancie `useBacktest` et `useRerunBacktest`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `id` | `string` | oui | — | Id du backtest. |

- **Exemple** (tiré de `src/app/app/backtest/[id]/page.tsx`) :
  ```tsx
  <BacktestDetail id={id} />
  ```
- **Utilisé par** : `src/app/app/backtest/[id]/page.tsx`.
- **Source** : `src/features/backtest/backtest-detail.tsx`.

### NewBacktestForm

- **Import** : `import { NewBacktestForm } from "@/features/backtest/new-backtest-form"`.
- **Rôle** : formulaire complet de création (`backtestSchema`, sections `GeneralSection` + `MarketSection`) ; redirige vers le détail créé.
- **Props** : aucune.
- **Exemple** (tiré de `src/app/app/backtest/new/page.tsx`) :
  ```tsx
  <NewBacktestForm />
  ```
- **Utilisé par** : `src/app/app/backtest/new/page.tsx`.
- **Source** : `src/features/backtest/new-backtest-form.tsx`.

### QuickBacktestForm

- **Import** : `import { QuickBacktestForm } from "@/features/backtest/quick-backtest-form"`.
- **Rôle** : test rapide sur un seul symbole (`quickBacktestSchema`, nom `Test rapide <symbol>`, période par défaut : 1 an jusqu'à aujourd'hui, `amount` 10 000, `fee` 0,1 %) ; redirige vers le détail créé.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `symbol` | `string` | oui | — | Symbole testé. |

- **Exemple** (tiré de `src/features/market/symbol-sheet.tsx`) :
  ```tsx
  <QuickBacktestForm symbol={symbol} />
  ```
- **Utilisé par** : `src/features/market/symbol-sheet.tsx`.
- **Source** : `src/features/backtest/quick-backtest-form.tsx`.

### GeneralSection

- **Import** : `import { GeneralSection } from "@/features/backtest/sections"`.
- **Rôle** : section « Général » (`name`, `strategy`) d'un formulaire `BacktestValues`, sous `FormProvider`.
- **Props** : aucune.
- **Exemple** (tiré de `src/features/backtest/new-backtest-form.tsx`) :
  ```tsx
  <GeneralSection />
  <MarketSection />
  ```
- **Utilisé par** : `src/features/backtest/new-backtest-form.tsx`.
- **Source** : `src/features/backtest/sections.tsx`.

### MarketSection

- **Import** : `import { MarketSection } from "@/features/backtest/sections"`.
- **Rôle** : section « Marché et période » (`symbols`, `start`, `end`, `amount`, `fee`) d'un formulaire `BacktestValues` ; libellé du montant selon `strategy`.
- **Props** : aucune.
- **Exemple** : voir `GeneralSection`.
- **Utilisé par** : `src/features/backtest/new-backtest-form.tsx`.
- **Source** : `src/features/backtest/sections.tsx`.

### EquityChart

- **Import** : `import { EquityChart } from "@/features/backtest/equity-chart"`.
- **Rôle** : carte « Courbe d'equity » : valeur du portefeuille dans le temps, en `BACKTEST_CURRENCY`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `data` | `EquityPoint[]` | oui | — | `result.equityCurve` ; `value` tracée. |
  | `positive` | `boolean` | oui | — | Vert si plus-value (`totalReturn >= 0`). |

- **Exemple** (tiré de `src/features/backtest/backtest-detail.tsx`) :
  ```tsx
  <EquityChart data={result.equityCurve} positive={Number(result.totalReturn) >= 0} />
  ```
- **Utilisé par** : `src/features/backtest/backtest-detail.tsx`.
- **Source** : `src/features/backtest/equity-chart.tsx`.

### ExecutionHistory

- **Import** : `import { ExecutionHistory } from "@/features/backtest/execution-history"`.
- **Rôle** : carte « Historique d'exécution » : une ligne par exécution (tentative, statut, date, résumé, durée).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `executions` | `BacktestExecution[]` | oui | — | Plus récente d'abord. |
  | `actions` | `ReactNode` | non | — | En-tête de carte (ex. bouton de relance). |

- **Exemple** (tiré de `src/features/backtest/backtest-detail.tsx`) :
  ```tsx
  <ExecutionHistory
      executions={backtest.executions}
      actions={
          <Button variant="outline" onClick={() => rerun.mutate()} disabled={!canRerun}>
              Relancer ce backtest
          </Button>
      }
  />
  ```
- **Utilisé par** : `src/features/backtest/backtest-detail.tsx`.
- **Source** : `src/features/backtest/execution-history.tsx`.

### BacktestStats

- **Import** : `import { BacktestStats } from "@/features/backtest/stats"`.
- **Rôle** : 4 `StatCard` de la liste : total, en cours, terminés et échoués (avec part en % du total), d'après le statut de la dernière exécution.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `backtests` | `Backtest[]` | oui | — | Liste non filtrée. |

- **Exemple** (tiré de `src/features/backtest/backtest-list.tsx`) :
  ```tsx
  <BacktestStats backtests={query.data ?? []} />
  ```
- **Utilisé par** : `src/features/backtest/backtest-list.tsx`.
- **Source** : `src/features/backtest/stats.tsx`.

### BacktestResultStats

- **Import** : `import { BacktestResultStats } from "@/features/backtest/stats"`.
- **Rôle** : 3 `StatCard` d'un résultat : rendement total, drawdown max (avec date), valeur finale (ordres, montant investi).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `result` | `BacktestResult` | oui | — | Résultat complet (ratios en fraction, montants en string). |

- **Exemple** (tiré de `src/features/backtest/backtest-detail.tsx`) :
  ```tsx
  <BacktestResultStats result={result} />
  ```
- **Utilisé par** : `src/features/backtest/backtest-detail.tsx`.
- **Source** : `src/features/backtest/stats.tsx`.

### `features/backtest/api.ts`

- **Import** : `import { getBacktest } from "@/features/backtest/api"`. Appeler via les hooks plutôt que directement.

| Export | Signature | Route (`apps/core-backend/API.md`) | Utilisé par |
| --- | --- | --- | --- |
| `createBacktest` | `(values: BacktestValues) => Promise<Backtest>` | `POST /api/backtest` | `useCreateBacktest` |
| `getBacktests` | `() => Promise<Backtest[]>` (renvoie `data`, ignore `count`) | `GET /api/backtest` | `useBacktests` |
| `getBacktest` | `(id: string) => Promise<BacktestDetails>` | `GET /api/backtest/:id` | `useBacktest` |
| `rerunBacktest` | `(id: string) => Promise<BacktestExecution>` | `POST /api/backtest/:id/executions` | `useRerunBacktest` |

Source : `src/features/backtest/api.ts`.

### `features/backtest/hook.ts`

- **Import** : `import { useBacktest } from "@/features/backtest/hook"`.

| Export | Signature | Clé / comportement | Utilisé par |
| --- | --- | --- | --- |
| `useCreateBacktest` | `() => UseMutationResult<Backtest, Error, BacktestValues>` | Invalide `["backtest", "list"]` au succès. | `new-backtest-form.tsx`, `quick-backtest-form.tsx` |
| `useBacktests` | `() => UseQueryResult<Backtest[]>` | `["backtest", "list"]`. | `backtest-list.tsx` |
| `useBacktest` | `(id: string) => UseQueryResult<BacktestDetails>` | `["backtest", "detail", id]` ; rafraîchi toutes les 2 s tant que la dernière exécution est dans `activeStatuses`. | `backtest-detail.tsx` |
| `useRerunBacktest` | `(id: string) => UseMutationResult<BacktestExecution>` (`mutate()` sans argument) | Invalide `["backtest"]` au succès. | `backtest-detail.tsx` |

Source : `src/features/backtest/hook.ts`.

### `features/backtest/schema.ts`

- **Import** : `import { backtestSchema, type BacktestValues } from "@/features/backtest/schema"`.

| Export | Valeur | Rôle (et unité) | Utilisé par |
| --- | --- | --- | --- |
| `backtestSchema` | zod `{ name, strategy: "dca" \| "lump_sum", symbols: string[] (≥ 1), start: Date, end: Date, amount: number > 0, fee: number 0–100 }`, `end > start` | Formulaire complet. `amount` en devise de saisie ; `fee` en **pourcentage** par ordre. Body de `POST /api/backtest`. | `new-backtest-form.tsx` |
| `BacktestValues` | `z.infer<typeof backtestSchema>` | Type des valeurs. | `new-backtest-form.tsx`, `api.ts` |
| `quickBacktestSchema` | zod `{ strategy, start, end, amount, fee }`, `end > start` | Test rapide : `name` et `symbols` ajoutés par `QuickBacktestForm`. | `quick-backtest-form.tsx` |
| `QuickBacktestValues` | `z.infer<typeof quickBacktestSchema>` | Type des valeurs. | `quick-backtest-form.tsx` |

Source : `src/features/backtest/schema.ts`.

### `features/backtest/constants.ts`

- **Import** : `import { statusBadges } from "@/features/backtest/constants"`.

| Export | Valeur | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `BACKTEST_CURRENCY` | `"EUR"` | Devise d'affichage des montants (cours non convertis). | `equity-chart.tsx`, `stats.tsx` |
| `activeStatuses` | `["PENDING", "RUNNING"]` | Statuts d'une exécution qui peut encore évoluer (miroir de `ACTIVE_STATUSES` backend). | `hook.ts`, `utils.ts`, `stats.tsx`, `statusFilters` |
| `strategyOptions` | `{ value: "dca" \| "lump_sum"; label: string }[]` | Options du `SelectField` `strategy`. | `sections.tsx`, `quick-backtest-form.tsx` |
| `strategyLabels` | `Record<InvestmentMode, string>` : `RECURRING` → « DCA mensuel », `LUMP_SUM` → « Lump sum » | Libellé de stratégie d'un backtest stocké. | `column.tsx`, `backtest-detail.tsx` |
| `statusBadges` | `Record<ExecutionStatus, { label; variant: "outline" \| "destructive" \| "secondary" \| "success" }>` | Badge de statut d'exécution. | `column.tsx`, `backtest-detail.tsx`, `execution-history.tsx` |
| `statusFilters` | `{ all, running, done, failed }` → `{ label, statuses: ExecutionStatus[] }` | Onglets de filtre de la liste (`all` = aucun filtre). | `backtest-list.tsx` |
| `StatusFilter` | `keyof typeof statusFilters` | Type de l'onglet actif. | `backtest-list.tsx` |

Source : `src/features/backtest/constants.ts`.

### `features/backtest/utils.ts`

- **Import** : `import { getExecution } from "@/features/backtest/utils"`.

| Export | Signature | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `getExecution` | `(b: Backtest) => BacktestExecution \| undefined` | Dernière exécution (`executions[0]`). | `column.tsx`, `backtest-detail.tsx` |
| `hasStatus` | `(b: Backtest, statuses: readonly ExecutionStatus[]) => boolean` | Statut de la dernière exécution dans la liste. | `hook.ts`, `backtest-list.tsx`, `stats.tsx` |
| `isActive` | `(e: BacktestExecution) => boolean` | Exécution `PENDING` ou `RUNNING`. | `backtest-detail.tsx`, `execution-history.tsx` |
| `getExecutionDuration` | `(e: BacktestExecution) => string \| null` | Durée `finishedAt − (startedAt ?? createdAt)`, « 2 min 5 s » ou « 12 s » (minimum 1 s) ; `null` si non terminée. | `column.tsx`, `backtest-detail.tsx`, `execution-history.tsx` |

Source : `src/features/backtest/utils.ts`.

### `features/backtest/column.tsx`

- **Import** : `import { backtestColumns, tradeColumns } from "@/features/backtest/column"`.

| Export | Type | Colonnes | Utilisé par |
| --- | --- | --- | --- |
| `backtestColumns` | `Column<Backtest>[]` | Nom, Stratégie, Symboles (nombre), Période, Rendement (`totalReturn` × 100 via `ChangeCell`), Statut (badge), Durée. | `backtest-list.tsx` |
| `tradeColumns` | `Column<Trade>[]` | Date, Symbole (`SymbolCell`), Prix d'achat (`formatNumber`, sans devise). | `backtest-detail.tsx` |

Source : `src/features/backtest/column.tsx`.

### `features/backtest/types.ts`

- **Import** : `import type { Backtest } from "@/features/backtest/types"`. `Decimal` → `string`, dates → `string` ISO.

| Export | Forme | Utilisé par |
| --- | --- | --- |
| `ExecutionStatus` | `"PENDING" \| "RUNNING" \| "COMPLETED" \| "FAILED" \| "CANCELLED"` | `utils.ts`, `constants.ts`, `stats.tsx` |
| `InvestmentMode` | `"LUMP_SUM" \| "RECURRING"` | `constants.ts` |
| `BacktestExecution` | `{ id, status, attempt, createdAt, startedAt, finishedAt, error, result?: { totalReturn: string \| null (fraction); totalTrades: number } \| null }` | `api.ts`, `utils.ts`, `execution-history.tsx` |
| `EquityPoint` | `{ date: "YYYY-MM-DD"; value: number; invested: number }` (devise, `invested` frais compris) | `equity-chart.tsx` |
| `Trade` | `{ date: "YYYY-MM-DD"; symbol: string; price: number }` (cours d'achat) | `column.tsx` |
| `BacktestResult` | `{ finalValue, totalInvested, totalReturn, maxDrawdown: string \| null; totalTrades: number; maxDrawdownDate: string \| null; equityCurve: EquityPoint[]; trades: Trade[] }` (ratios en fraction) | `stats.tsx` |
| `Backtest` | `{ id, name, symbols, startDate, endDate, investmentMode, createdAt, executions: BacktestExecution[] }` (plus récente d'abord) | `api.ts`, `utils.ts`, `stats.tsx`, `column.tsx` |
| `BacktestDetails` | `Backtest & { executions (toutes); result: BacktestResult \| null }` | `api.ts`, `backtest-detail.tsx` |

Source : `src/features/backtest/types.ts`.

## `features/market`

### MarketList

- **Import** : `import { MarketList } from "@/features/market/market-list"`.
- **Rôle** : écran marché : onglets de catégorie, `SymbolSearch`, puis `DataTable` des actifs par défaut (`useDefaultAssets`) ; clic → `${prefix}/market/<symbol>`.
- **Props** : aucune.
- **Exemple** (tiré de `src/app/app/market/page.tsx`) :
  ```tsx
  <PageHeader title="Marché" description="Prix en temps réel via Yahoo Finance" />
  <MarketList />
  ```
- **Utilisé par** : `src/app/app/market/page.tsx`.
- **Source** : `src/features/market/market-list.tsx`.

### SymbolDetail

- **Import** : `import { SymbolDetail } from "@/features/market/symbol-detail"`.
- **Rôle** : écran d'un symbole : `PageHeader` (avec `SymbolCell size="lg"` et `SymbolSheet`) puis `PriceChart`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `symbol` | `string` | oui | — | Symbole yahoo de l'URL. |

- **Exemple** (tiré de `src/app/app/market/[symbol]/page.tsx`) :
  ```tsx
  <PageLayout>
      <SymbolDetail symbol={symbol} />
  </PageLayout>
  ```
- **Utilisé par** : `src/app/app/market/[symbol]/page.tsx`.
- **Source** : `src/features/market/symbol-detail.tsx`.

### PriceChart

- **Import** : `import { PriceChart } from "@/features/market/price-chart"`.
- **Rôle** : carte « Prix » d'un symbole avec onglets `periodOptions` (`1d` par défaut) ; charge via `useMarketDetails`, affiche en `MARKET_CURRENCY`.
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `symbol` | `string` | oui | — | Symbole yahoo. |

- **Exemple** (tiré de `src/features/market/symbol-detail.tsx`) :
  ```tsx
  <PriceChart symbol={symbol} />
  ```
- **Utilisé par** : `src/features/market/symbol-detail.tsx`.
- **Source** : `src/features/market/price-chart.tsx`.

### SymbolSearch

- **Import** : `import { SymbolSearch } from "@/features/market/symbol-search"`.
- **Rôle** : bouton « Rechercher un symbole… » qui ouvre `SymbolPicker` et navigue vers `${prefix}/market/<symbol>`.
- **Props** : aucune.
- **Exemple** (tiré de `src/features/market/market-list.tsx`) :
  ```tsx
  <SymbolSearch />
  ```
- **Utilisé par** : `src/features/market/market-list.tsx`.
- **Source** : `src/features/market/symbol-search.tsx`.

### SymbolSheet

- **Import** : `import { SymbolSheet } from "@/features/market/symbol-sheet"`.
- **Rôle** : bouton « Acheter » ouvrant un `AppSheet` à onglets « Trade » (vide) et « Test » (`QuickBacktestForm`).
- **Props** :

  | Nom | Type | Requis | Défaut | Description |
  | --- | --- | --- | --- | --- |
  | `symbol` | `string` | oui | — | Symbole de la page. |

- **Exemple** (tiré de `src/features/market/symbol-detail.tsx`) :
  ```tsx
  <PageHeader
      leading={<SymbolCell symbol={symbol} name={"test"} logoUrl={undefined} size="lg" />}
      actions={<SymbolSheet symbol={symbol} />}
  />
  ```
- **Utilisé par** : `src/features/market/symbol-detail.tsx`.
- **Source** : `src/features/market/symbol-sheet.tsx`.

### `features/market/api.ts`

- **Import** : `import { getDefaultAssets } from "@/features/market/api"`. Appeler via les hooks. Routes relayées par le proxy core-backend, détail dans `apps/market-service/API.md`.

| Export | Signature | Route | Utilisé par |
| --- | --- | --- | --- |
| `getDefaultAssets` | `() => Promise<MarketAsset[]>` | `GET /api/market/defaults` | `useDefaultAssets` |
| `getAssetsDetails` | `(symbol: string, period: Period) => Promise<MarketDetails[]>` | `GET /api/market/details/:id?period=` | `useMarketDetails` |
| `getSearchAssets` | `(query: string) => Promise<MarketData[]>` | `GET /api/market/search?query=` | `useMarketSearch` |

Source : `src/features/market/api.ts`.

### `features/market/hook.ts`

- **Import** : `import { useDefaultAssets } from "@/features/market/hook"`.

| Export | Signature | Clé / comportement | Utilisé par |
| --- | --- | --- | --- |
| `useDefaultAssets` | `() => UseQueryResult<MarketAsset[]>` | `["market", "list"]`, rafraîchi toutes les 30 s. | `market-list.tsx` |
| `useMarketDetails` | `(symbol: string, period: Period) => UseQueryResult<MarketDetails[]>` | `["market", "detail", symbol, period]`, `staleTime` 60 s, données précédentes gardées au changement de période. | `price-chart.tsx` |
| `useMarketSearch` | `(query: string) => UseQueryResult<MarketData[]>` | `["market", "search", query]`, actif si `query.length >= MIN_SEARCH_LENGTH`. | `components/symbol-picker.tsx` |

Source : `src/features/market/hook.ts`.

### `features/market/constants.ts`

- **Import** : `import { MARKET_CURRENCY } from "@/features/market/constants"`.

| Export | Valeur | Rôle | Utilisé par |
| --- | --- | --- | --- |
| `MARKET_CURRENCY` | `"USD"` | Devise d'affichage des cours (yahoo ne les convertit pas). | `column.tsx`, `price-chart.tsx` |
| `MIN_SEARCH_LENGTH` | `3` | Longueur minimale d'une recherche de symbole (le backend exige 2). | `hook.ts`, `components/symbol-picker.tsx` |
| `periodOptions` | `{ value: Period; label: string; interval: string }[]` : `1d` « 1J » 5 min, `1w` « 1S » 1 h, `1m` « 1M » 1 jour, `1y` « 1A » 1 semaine, `max` « Max » 1 mois | Onglets de période et pas des points. | `price-chart.tsx` |

Source : `src/features/market/constants.ts`.

### `features/market/column.tsx`

- **Import** : `import { marketColumns } from "@/features/market/column"`.

| Export | Type | Colonnes | Utilisé par |
| --- | --- | --- | --- |
| `marketColumns` | `Column<MarketAsset>[]` | Symbole (`SymbolCell`), Prix (`formatPrice` en `MARKET_CURRENCY`), Variation 24 h (`ChangeCell`, pourcentage), Volume 24 h (`formatVolume`), Tendance (`Sparkline` de `history`). | `market-list.tsx` |

Source : `src/features/market/column.tsx`.

### `features/market/types.ts`

- **Import** : `import type { MarketAsset, Period } from "@/features/market/types"`.

| Export | Forme | Utilisé par |
| --- | --- | --- |
| `Period` | `"1d" \| "1w" \| "1m" \| "1y" \| "max"` | `api.ts`, `hook.ts`, `constants.ts`, `price-chart.tsx` |
| `MarketAsset` | `{ symbol; name; logoUrl?; price: number; change24h: number (pourcentage, 1,5 = +1,5 %); volume24h: number; history: MarketDetails[] }` | `api.ts`, `column.tsx` |
| `MarketDetails` | `{ date: string (ISO); price: number }` | `api.ts`, `MarketAsset.history` |
| `MarketData` | `{ symbol; name; exchange; assetType; logoUrl? }` | `api.ts`, `components/symbol-picker.tsx` |

Source : `src/features/market/types.ts`.
