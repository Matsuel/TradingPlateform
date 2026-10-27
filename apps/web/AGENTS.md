<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# web — conventions du projet

Next.js App Router + React 19 + Tailwind 4 + shadcn/base-ui + react-hook-form/zod + TanStack Query. Respecte les conventions existantes ; ne change pas la structure.

## Structure `src/`

| Dossier | Rôle |
| --- | --- |
| `app/` | Routes (groupes `(auth)`, `(base)`, `app/`). Pages fines : elles composent des `features/` et `components/`. |
| `features/<domaine>/` | Code métier du domaine : `api.ts`, `types.ts`, `hook.ts`, `schema.ts`, `column.tsx`, formulaires/sections. |
| `components/` | Composants partagés (`ui/` = shadcn, `form/`, `data-table/`, `page-layout/`, `app-sheet/`). |
| `lib/` | Utilitaires transverses (`api.ts` → `apiFetch`, `auth.ts`, `session.ts`, `format.ts`, `utils.ts`). |
| `hooks/`, `provider/`, `constants/` | Hooks génériques, providers, constantes. |

## Règles

- Appels API via `apiFetch` (`lib/api.ts`) depuis `features/<domaine>/api.ts` ; lecture/cache avec TanStack Query dans `hook.ts`. Pas de `fetch` direct dans un composant.
- Formulaires : react-hook-form + schéma zod du `features/<domaine>/schema.ts` + champs de `components/form/fields`. Pas de nouveau champ si un existant convient.
- Composants UI : réutilise `components/ui` (ne modifie pas un composant shadcn sauf besoin réel) ; classes via `cn` de `lib/utils`.
- Server Component par défaut ; `"use client"` seulement si nécessaire.
- Nouveau domaine : copie la forme de `features/market` / `features/backtest`.
- Avant de coder une API Next, lis le guide dans `node_modules/next/dist/docs/` (voir bloc ci-dessus).
- `bun run lint` doit passer.

## Ajouter une feature `<domaine>` (checklist)

1. `features/<domaine>/types.ts` : types alignés sur l'API de core-backend.
2. `features/<domaine>/api.ts` : fonctions `apiFetch` (aucun `fetch` ailleurs).
3. `features/<domaine>/hook.ts` : TanStack Query (`useQuery`/`useMutation`).
4. `features/<domaine>/schema.ts` : schéma zod si formulaire ; champs via `components/form/fields`.
5. `features/<domaine>/column.tsx` si table (`components/data-table`).
6. Composants propres au domaine dans `features/<domaine>/` ; composant réutilisable → `components/`.
7. Page dans `app/app/<domaine>/page.tsx`, fine : compose les features. Entrée sidebar dans `constants/sidebar.tsx`.
8. Copie la forme de `features/market` et `features/backtest`.
