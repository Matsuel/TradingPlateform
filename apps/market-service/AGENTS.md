# market-service

API Express 5 de données de marché (yahoo-finance2), port 8001. Sans base de données ni auth. **Jamais appelé par le web** : core-backend (`routes/market/` + `utils/proxy.ts`) relaie `/api/market/*` ici et vérifie la session : pas de CORS ni d'auth ici, l'utilisateur authentifié arrive dans l'en-tête `x-user-id` (de confiance). Ne pas exposer ce service publiquement. **Calqué sur `apps/core-backend`** : même découpage en couches, mêmes conventions. Lis `../core-backend/AGENTS.md` et reprends ses règles.

## Architecture en couches

```
routes/<domaine>/   →  controller/  →  services/  →  repositories/  →  yahoo-finance2
 (descripteurs)        (HTTP)          (métier)       (sources externes)
```

Mêmes dossiers que core-backend (`builder/`, `models/`, `errors/`, `middleware/`, `utils/`, `constants/`, `interfaces/`) ; crée un dossier uniquement quand un fichier en a besoin.

## Conventions

- Identiques à core-backend : nommage `<domaine>.<couche>.ts`, `export default`, controllers en méthodes fléchées, erreurs lancées (`AppError`) et formatées par `error.middleware`, handlers enveloppés par `asyncHandler`.
- Routes : préfixe `/api/market`.
- Env via `env.ts` (zod).
- Logs : `Logger.here()` de `@trading-plateform/utils`, pas de `console.log`.
- **N'ajoute pas d'accès DB ici** : core-backend est le seul service qui écrit en base.

## Commandes

```bash
bun run index.ts
bunx tsc --noEmit
```
