# web

Front Next.js (App Router) de Azimut : il affiche les données de core-backend et n'appelle que lui.

## Lancer

```bash
bun install            # depuis la racine du monorepo
bun run dev            # http://localhost:3000, core-backend attendu sur NEXT_PUBLIC_API_URL
```

`.env` : `NEXT_PUBLIC_API_URL=http://localhost:8000/api` (validée au démarrage par `src/lib/env.ts`).

## Scripts

| Script | Rôle |
| --- | --- |
| `bun run dev` / `build` / `start` | Serveur de dev, build, serveur de prod. |
| `bun run lint` | ESLint (règles Next et React). |
| `bun run format` | Biome : formate et trie les imports. |
| `bun run format:check` | Biome sans écrire : échoue sur un fichier non formaté. |

## Où lire

- Conventions : [`AGENTS.md`](AGENTS.md).
- Composants, helpers et exports des features : [`COMPONENTS.md`](COMPONENTS.md).
- Routes de core-backend appelées : [`../core-backend/API.md`](../core-backend/API.md).
