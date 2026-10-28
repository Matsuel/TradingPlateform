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

## Structure `src/`

| Dossier | Rôle |
| --- | --- |
| `app/` | Routes (groupes `(auth)`, `(base)`, `app/`). Pages fines : `await params`, puis composent un composant de `features/`. Aucun appel API ni logique. |
| `features/<domaine>/` | Code d'un domaine (voir ci-dessous). |
| `components/` | Composants réutilisés par ≥ 2 domaines (`ui/` = shadcn, `form/`, `data-table/`, `page-layout/`, `app-sheet/`, `chart.tsx`, `stat-card.tsx`). |
| `lib/` | Transverse : `api.ts` (`apiFetch`), `format.ts` (tous les formatters réutilisés), `path.ts`, `auth.ts`, `session.ts`, `utils.ts` (`cn`). |
| `hooks/`, `provider/`, `constants/` | Hooks génériques, providers, constantes globales (sidebar). |

## Rangement dans `features/<domaine>/`

Chaque élément a un fichier attitré ; copie la forme de `features/backtest` et `features/market`.

| Fichier | Contenu |
| --- | --- |
| `types.ts` | Types alignés sur les réponses de core-backend (`Decimal` → `string`, dates → `string` ISO), unité en commentaire. |
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
- Composants partagés : consulte `COMPONENTS.md`, réutilise-les en priorité (`DataTable`, `StatCard`, `PriceAreaChart`, `SymbolCell`, `PageHeader`). Un besoin manquant s'ajoute par une prop optionnelle rétrocompatible (slot `ReactNode` nommé `actions`, `badge`, `leading`), jamais par une copie. Ne modifie un composant `ui/` shadcn qu'en cas de besoin réel.
- Formulaires : react-hook-form + schéma de `schema.ts` + champs de `components/form/fields`. Après création, redirige vers la page de détail de la ressource.
- Server Component par défaut ; `"use client"` seulement si le fichier utilise hooks, état ou événements.
- Classes via `cn` de `lib/utils`.
- Avant de coder une API Next, lis le guide dans `node_modules/next/dist/docs/` (voir bloc ci-dessus).

## Ajouter une feature `<domaine>` (checklist)

1. Données ou métriques manquantes → backend d'abord (voir `../../AGENTS.md`).
2. `types.ts`, `api.ts`, `hook.ts`, puis `constants.ts`/`utils.ts` si besoin.
3. `schema.ts` si formulaire ; `column.tsx` si table ; `stats.tsx` si cartes.
4. Composants `<sujet>.tsx` composés de `components/` (catalogue `COMPONENTS.md`) ; nouvelle entrée dans `COMPONENTS.md` pour chaque composant partagé ou export de feature créé.
5. Page `app/app/<domaine>/page.tsx` fine ; entrée sidebar dans `constants/sidebar.tsx`.
