<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# web — conventions du projet

Next.js App Router + React 19 + Tailwind 4 + shadcn/base-ui + react-hook-form/zod + TanStack Query. Respecte `../../AGENTS.md`, en particulier « Responsabilités » : **le web affiche, le backend calcule**.

## Responsabilité du web

Le web affiche les valeurs renvoyées par core-backend. Calculs autorisés, et seulement ceux-ci :

- formatage : devise, nombre, date, durée entre deux timestamps de l'API ;
- conversion d'unité : ratio → pourcentage (`Number(ratio) * 100`), `Decimal` sérialisé en `string` → `Number` ;
- tri, filtre et sélection pour l'affichage (`getExecution`, filtres d'onglets) ;
- état d'interface (onglet actif, formulaire, polling).

Un écran qui a besoin d'une valeur métier absente de l'API (total, métrique, règle d'éligibilité) déclenche un ajout côté backend : le web l'affiche une fois exposée. Une règle métier que le front reflète pour l'ergonomie (bouton désactivé pendant une exécution active) reste imposée par le backend ; le front n'en est qu'un miroir.

## Maquette d'abord (règle stricte)

Un écran, ou une section d'écran, se code uniquement depuis un cadre Figma **validé** :

- le cadre existe dans le fichier `Trading` (clé dans `roadmap/README.md`) et figure dans la ligne « Maquettes » du `US.md` de la feature, avec son `node-id`, marqué `validée le JJ/MM/AAAA` ;
- **validée** = l'utilisateur a approuvé ce cadre explicitement (« on part sur A ») ; un cadre dessiné par l'agent reste `proposée` jusque-là ;
- sans cadre validé : dessine ou mets à jour la maquette dans Figma, présente-la, attends la validation, note-la dans `US.md`, puis code.

Restent hors règle, sans nouveau cadre : composant non visuel, correctif de bug ou de responsive qui respecte la maquette, retouche demandée explicitement par l'utilisateur (libellé, champ retiré) ; l'écart à la maquette est alors noté dans le résumé.

## shadcn d'abord (règle stricte)

Toute brique d'interface vient de `components/ui/` (shadcn, style `base-nova` de `components.json`) :

- **Primitive** (bouton, champ, label, tableau, carte, badge, onglets, dialog, menu…) : le composant `ui/` correspondant. Absent du dossier : ajoute-le avec `bunx --bun shadcn@latest add <nom>`, puis utilise-le.
- **Style ou état que le composant n'a pas** : un **variant** de plus dans son `cva`, dans `ui/<composant>.tsx` (ex. `success` de `Badge`), appelé par `variant="…"`. Un style partagé par deux écrans est un variant.
- **Classes autour d'un composant `ui/`** : la mise en page seulement (marges, grille, largeur, position).
- **Élément HTML brut** à la place d'une primitive (`<table>`, `<button>`, `<label>`, `<select>`, `<input>`, `<textarea>`, barre de progression en `<div>`) : seulement si shadcn n'a aucun équivalent, avec la raison en commentaire sur la ligne.
- `components/` et `features/` composent les `ui/` ; un variant ajouté a son entrée dans `COMPONENTS.md` (« `components/ui` ») dans le même diff.

## Structure `src/`

| Dossier | Rôle |
| --- | --- |
| `app/` | Routes (groupes `(auth)`, `(base)`, `app/`). Pages fines : `await params`, puis composent un composant de `features/`. Aucun appel API ni logique. |
| `features/<domaine>/` | Code d'un domaine (voir ci-dessous). |
| `components/` | Composants réutilisés par ≥ 2 domaines (`ui/` = shadcn, `form/`, `data-table/`, `page-layout.tsx`, `app-sheet.tsx`, `chart.tsx`, `stat-card.tsx`). Exception documentée : `symbol-picker.tsx` dépend de `features/market` (recherche), car les champs de `form/` l'utilisent. |
| `lib/` | Transverse : `api.ts` (`apiFetch`), `format.ts` (tous les formatters réutilisés), `routes.ts` (toutes les URL), `navigation.ts` (onglet actif), `env.ts` (env validé), `auth.ts`, `session.ts`, `utils.ts` (`cn`). |
| `hooks/`, `provider/`, `constants/` | Hooks génériques, providers, constantes globales (sidebar, glossaire, pagination). |
| `proxy.ts` | Dans `src/`, au niveau de `app/` (sinon Next l'ignore). Redirection optimiste sur le cookie ; la session réelle se vérifie dans les layouts (`requireSession`). |

## Forme du code

- **Formatage : Biome** (`biome.json`), lancé par `bun run format` (formate et trie les imports) ; `bun run format:check` échoue sur un fichier non formaté. 4 espaces, guillemets doubles, sans point-virgule, 120 colonnes. `components/ui/` (shadcn) et le Markdown sont exclus. ESLint (`bun run lint`) garde les règles Next et React.
- **Fichiers** en kebab-case (`app-header.tsx`), un composant exporté **nommé** (`export function AppHeader`) ; `export default` seulement là où Next l'exige (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`). Pas de dossier pour un seul fichier.
- **Pages** : `export default function XPage()`, typées par les helpers globaux `PageProps<"/route">` / `LayoutProps<"/route">` ; `export const metadata = { title }` (le gabarit « %s · MarketFlow » est dans le layout racine), `generateMetadata` pour une page dynamique.
- **Navigation** : toute URL vient de `routes` (`lib/routes.ts`) ; un lien interne est un `next/link`, jamais un `<a href>` (rechargement complet, cache TanStack perdu). Un bouton-lien : `<Button nativeButton={false} render={<Link href={…} />}>`, jamais `<Link><Button>` (HTML invalide).
- **Nouvelle page** : sa route dans `routes`, son onglet dans `constants/sidebar.tsx`, puis `app/app/<route>/page.tsx`. Une page pas encore construite n'affiche que `PageHeader` (titre et description).
- `process.env` ne se lit que dans `lib/env.ts` (validé par zod).
- **Libellés** : tout texte affiché vient des dictionnaires `messages/fr.json` et `messages/en.json` (mêmes clés dans les deux), lu par `useTranslations` (`getTranslations` dans une fonction `async` : `generateMetadata`). La langue active vient du cookie `locale` (`src/i18n/`), jamais de l'URL. Un schéma zod traduit est une fabrique `create<Nom>Schema(t)` ; une constante porte une clé de dictionnaire, pas un libellé (`constants/sidebar.tsx`).
- **Nombres et dates** : formatés par `useFormatters()` (`lib/format.ts`), dans la langue active ; jamais de locale en dur. Un helper hors composant reçoit les `Formatters` en premier argument ; des colonnes qui formatent sont un hook `use<Nom>Columns()`.
- **Typographie** : tokens du thème (`text-h1` à `text-h3`, `text-stat`, `text-body`, `text-body-medium`, `text-body-semibold`, `text-small`, `text-small-medium`, dans `globals.css`), pas les tailles Tailwind (`text-sm`, `text-xs`).
- **Couleur d'une variation** : `trendOf` et `trendStyles` (`lib/trend.ts`).

## Taille et complexité

Le code reste lisible d'une traite ; au-delà de ces seuils, découpe avant d'ajouter :

- **Fichier** ≤ 150 lignes (hors `components/ui/` et `constants/glossary.ts`) ; `verify` avertit au-delà.
- **Composant ou fonction** ≤ 60 lignes (`verify` avertit au-delà), JSX imbriqué sur peu de niveaux : une ligne de liste, un en-tête, un bloc deviennent un sous-composant nommé (`AllocationRow`, `ResultHeadline`).
- **Props** ≤ 8 (`verify` avertit au-delà) ; au-delà, une liste de données remplace les variantes (`AreaSeriesChart` et son `series`).
- **Une table plutôt qu'une répétition** : une même correspondance (métrique → libellé, aide, format) écrite deux fois devient une table partagée (`features/backtest/metrics.tsx`).
- **Un état unique plutôt que des conditions répétées** : un écran à plusieurs états calcule l'état une fois, puis l'affiche (`searchState` de `SymbolPicker`).

## Rangement dans `features/<domaine>/`

Chaque élément a un fichier attitré ; copie la forme de `features/backtest` et `features/market`.

| Fichier | Contenu |
| --- | --- |
| `types.ts` | Types alignés sur les réponses de core-backend (`Decimal` → `string`, dates → `string` ISO), unité en commentaire. Une donnée décrite par un contrat est **dérivée** de `@trading-plateform/contracts` par `import type` (`Pick`, `Omit`, réexport), jamais recopiée ; jamais d'import runtime du package (zod n'est pas embarqué dans le front). |
| `api.ts` | Fonctions `apiFetch`, une par route. Aucun `fetch` ailleurs. |
| `hook.ts` | TanStack Query : clés `[domaine, "list"]`, `[domaine, "detail", id]` ; mutations qui invalident les clés des vues impactées. |
| `schema.ts` | Schémas zod des formulaires. |
| `constants.ts` | Libellés, options, badges de statut, groupes de statuts, devise d'affichage. |
| `utils.ts` | Helpers purs du domaine (sélection, prédicats de statut, durées). |
| `column.tsx` | Toutes les `Column<T>` du domaine pour `components/data-table`. |
| `stats.tsx` | Groupes de `StatCard` du domaine. |
| `<sujet>.tsx` | Un composant d'écran ou de section par fichier, kebab-case (`backtest-detail.tsx`, `execution-history.tsx`). |

Règles :

- Un formatter utilisé par ≥ 2 fichiers vit dans `lib/format.ts` ; un formatter propre à un seul composant (ticks d'un graphique) est une constante en tête de ce fichier.
- Une mutation est instanciée **une fois** par écran, dans le composant d'écran ; les sections reçoivent l'action ou le bouton par props (`actions`).
- `DataTable` : `query` pour des lignes issues d'une requête (états chargement / erreur), `rows` pour des lignes déjà en mémoire (sous-liste d'un détail chargé). Ne pas fabriquer un faux `query`.
- Conversion `Decimal` → `number` : `fromDecimal` (`features/<domaine>/utils.ts`), qui garde `null` pour un champ absent.
- Composants partagés : consulte `COMPONENTS.md`, réutilise-les en priorité (`DataTable`, `StatCard`, `AreaSeriesChart`, `SymbolCell`, `PageHeader`). Un besoin manquant s'ajoute par une prop optionnelle rétrocompatible (slot `ReactNode` nommé `actions`, `badge`, `leading`), jamais par une copie. Un style manquant à une primitive s'ajoute en variant `ui/` (« shadcn d'abord »).
- **Aide sur les données** : une donnée calculée ou interprétée affichée (métrique, taux, écart, frais, empreinte, paramètre qui change le calcul) a son entrée dans `constants/glossary.ts` (sa `source`, clé de l'entrée) et ses textes dans `messages/fr.json` **et** `messages/en.json` (`glossary.<clé>` : `title`, `purpose`, `computation`, `unit`, et si besoin `formula`, `readingTip`), avec son libellé en `InfoHint` (ou `hint` d'un champ) **dans le même diff**. `source` cite le symbole qui calcule la donnée ; les textes se relisent contre lui quand ce calcul change. Une phrase déjà écrite (montant en euros ou en dollars, TWR) s'insère par `{moneyUnit}`, `{marketMoneyUnit}`, `{twr}` au lieu de se recopier. Champs bruts évidents (nom, date, symbole, statut) : pas d'aide.
- Formulaires : react-hook-form + schéma de `schema.ts` + champs de `components/form/fields`. Après création, redirige vers la page de détail de la ressource.
- Server Component par défaut ; `"use client"` seulement si le fichier utilise hooks, état ou événements.
- Classes via `cn` de `lib/utils`.
- Avant de coder une API Next, lis le guide dans `node_modules/next/dist/docs/` (voir bloc ci-dessus).

## Ajouter une feature `<domaine>` (checklist)

1. Données ou métriques manquantes → backend d'abord (voir `../../AGENTS.md`).
2. `types.ts`, `api.ts`, `hook.ts`, puis `constants.ts`/`utils.ts` si besoin.
3. `schema.ts` si formulaire ; `column.tsx` si table ; `stats.tsx` si cartes.
4. Composants `<sujet>.tsx` codés depuis le cadre validé (« Maquette d'abord »), composés de `components/` (catalogue `COMPONENTS.md`) ; nouvelle entrée dans `COMPONENTS.md` pour chaque composant partagé ou export de feature créé.
5. Route dans `lib/routes.ts`, page `app/app/<domaine>/page.tsx` fine, entrée sidebar dans `constants/sidebar.tsx`.
