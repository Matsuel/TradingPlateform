# Dette technique

Registre de la dette connue, à corriger avant qu'elle ne grossisse. La règle qui l'alimente est dans [`AGENTS.md`](AGENTS.md#dette-technique). Audit initial du 2026-11-12 sur tout le dépôt (222 fichiers TypeScript hors `generated/` et `components/ui/`) ; les audits plus anciens (`audit/web.md`) restent des photos datées.

**Gravité** : `haute` = risque en production ou blocage d'un utilisateur ; `moyenne` = coût qui augmente à chaque feature ; `basse` = hygiène. **Effort** : S (< 2 h), M (< 1 jour), L (plus).

## Ouverte

| ID | Gravité | Zone | Dette | Où | Correction | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| TD-02 | moyenne | tous | **Couverture de tests : restent les repositories et les composants web.** Services, consumers, schémas, routes HTTP (core-backend, market-service), `KafkaConsumer`, middlewares, client de cours de l'engine, hooks et `ErrorState` web sont testés. Sans test : les repositories Prisma (il faut une base de test jetable) et la majorité des composants et écrans web. | `apps/core-backend/repositories`, `apps/web/src/{components,features}` | Une base PostgreSQL de test (conteneur) pour les repositories ; un test par composant partagé de `COMPONENTS.md`. | L |
| TD-03 | haute | dépôt | **Ni CI, ni image, ni gabarit d'env.** Aucun `.github/workflows`, aucun `Dockerfile`, aucun `.env.example` : `verify` ne tourne qu'en local, une variable manquante ne se découvre qu'au démarrage. Prévu par les features 21 et 22 de la roadmap. | racine | Un workflow qui lance `verify` ; un `.env.example` par app, aligné sur chaque `env.ts`. | M |
| TD-21 | basse | core-backend | **Limites de débit locales au process.** Les compteurs `express-rate-limit` sont en mémoire et par IP, sans `trust proxy` ni `keyGenerator` : derrière un reverse proxy tous les utilisateurs partagent un compteur, et avec plusieurs instances chaque instance compte à part. | `core-backend/middleware/rate-limit.middleware.ts`, `core-backend/index.ts` | `app.set('trust proxy', …)` selon le déploiement (feature 22) et un store partagé si plusieurs instances. | S |
| TD-22 | basse | web | **Le formulaire ne plafonne pas les allocations.** Le backend refuse plus de 49 symboles (50 pour market-service moins le benchmark) ; le formulaire n'a pas la même limite et affiche alors l'erreur générique. | `web/src/features/backtest/schema.ts` | Plafond dans `createBacktestFormSchema` avec un message traduit. | S |
| TD-23 | basse | backtest-engine | **Chaque exécution rappelle Yahoo.** Les cours d'un backtest ne sont pas mis en cache (l'empreinte `fingerprintPrices` hache les données, mais `fetchedAt` et la fraîcheur de la dernière clôture se perdraient). Un backtest relancé 10 fois fait 10 appels par symbole. | `market-service/services/market.service.ts` (`getDailyCloses`) | Cache des clôtures antérieures à la veille (immuables), publié avec le `fetchedAt` réel de la lecture. | M |

**Hors périmètre de cette passe** : TD-03 (CI, image, gabarit d'env).

## Fermée

| ID | Fermée le | Commit |
| --- | --- | --- |
| TD-01 | 2026-11-12 | `0f5d3dd` |
| TD-04 | 2026-11-12 | `31a6edc` |
| TD-05 | 2026-11-12 | `31a6edc` |
| TD-06 | 2026-11-12 | `0f95f1b` |
| TD-07 | 2026-11-12 | `31a6edc` |
| TD-08 | 2026-11-12 | `31a6edc` |
| TD-09 | 2026-11-12 | `0f95f1b` |
| TD-10 | 2026-11-12 | `31a6edc` |
| TD-11 | 2026-11-12 | `05941a7` |
| TD-12 | 2026-11-12 | `0f5d3dd` |
| TD-13 | 2026-11-12 | `e41cd0b` |
| TD-14 | 2026-11-12 | `d301f28` |
| TD-15 | 2026-11-12 | `32c630d` |
| TD-16 | 2026-11-12 | `edb7fa7` |
| TD-17 | 2026-11-12 | `6a11371` |
| TD-18 | 2026-11-12 | `44f5bc9` |
| TD-19 | 2026-11-12 | `31a6edc` |
| TD-20 | 2026-11-12 | `e390fcf` |
