# Dette technique

Registre de la dette connue, à corriger avant qu'elle ne grossisse. La règle qui l'alimente est dans [`AGENTS.md`](AGENTS.md#dette-technique). Audit initial du 2026-11-12 sur tout le dépôt (222 fichiers TypeScript hors `generated/` et `components/ui/`) ; les audits plus anciens (`audit/web.md`) restent des photos datées.

**Gravité** : `haute` = risque en production ou blocage d'un utilisateur ; `moyenne` = coût qui augmente à chaque feature ; `basse` = hygiène. **Effort** : S (< 2 h), M (< 1 jour), L (plus).

## Ouverte

| ID | Gravité | Zone | Dette | Où | Correction | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| TD-02 | moyenne | tous | **Couverture de tests encore partielle.** Un dossier `test/` existe dans chaque app (services, consumer, schémas, middleware, clé interne, `apiFetch`). Restent sans test : les controllers et routes HTTP (aucun test d'intégration avec Express), les repositories (Prisma), `packages/kafka` (`KafkaConsumer` et sa reprise), les composants et hooks web. | `apps/core-backend/{controller,repositories}`, `packages/kafka`, `apps/web/src` | Un test d'intégration HTTP par route de `API.md` avec un faux repository ; un test de `KafkaConsumer` avec un `Consumer` factice ; tests de hooks web (`useApiErrorMessages`, `useAuthErrorMessage`). | L |
| TD-03 | haute | dépôt | **Ni CI, ni image, ni gabarit d'env.** Aucun `.github/workflows`, aucun `Dockerfile`, aucun `.env.example` : `verify` ne tourne qu'en local, une variable manquante ne se découvre qu'au démarrage. Prévu par les features 21 et 22 de la roadmap. | racine | Un workflow qui lance `verify` ; un `.env.example` par app, aligné sur chaque `env.ts`. | M |
| TD-06 | moyenne | backtest-engine | **Contourne market-service.** L'engine appelle Yahoo directement et redéclare `IMarketRepository`, `YahooFinance` et sa config, alors que market-service est l'API de données de marché. Deux sources, deux politiques d'erreur, aucun cache commun. | `backtest-engine/repositories/market.repository.ts`, `market-service/repositories/market.repository.ts` | Choisir un seul accès Yahoo : soit l'engine passe par market-service, soit le client Yahoo devient un package partagé. À décider (décision d'architecture). | M |
| TD-09 | moyenne | market-service, engine | **Pas de cache ni de limite sur Yahoo.** Chaque recherche, chaque détail et chaque exécution de backtest rappelle `yahoo-finance2` ; un fournisseur gratuit finit par limiter. | `market-service/repositories/market.repository.ts`, `backtest-engine/repositories/market.repository.ts` | Cache court en mémoire dans market-service (TTL par `Period`), relié à TD-06. | M |
| TD-13 | moyenne | core-backend | **Calcul dans le service.** `businessDays`, `countPeriods` et `preview` (versements et rebalancements estimés) vivent dans `backtest.service.ts` (272 lignes), alors que « tout calcul de simulation » appartient à `engine/`. Les règles de l'engine sont recopiées en commentaire. | `core-backend/services/backtest.service.ts:47-70,107` | Déplacer l'estimation dans un module partagé avec l'engine (package) ou faire calculer l'aperçu par l'engine. À décider. | M |
| TD-15 | basse | core-backend, market-service | **Code copié entre services** : `RouteDescriptor`, `registerRoutes`, middleware d'erreur, `env.ts`. C'est la convention actuelle (« s'en inspirent »), mais les copies divergent déjà (le middleware de core-backend rend `code`, pas celui de market-service). | `core-backend/{builder,models,middleware}`, `market-service/{builder,models,middleware}` | Extraire un package `@trading-plateform/http` quand un troisième service HTTP apparaît. | M |

**Décisions attendues** : TD-06 (qui appelle Yahoo : l'engine via market-service, ou un client partagé), TD-09 (cache, lié à TD-06), TD-13 (où vit l'estimation de l'aperçu) et TD-15 (package HTTP partagé). **Hors périmètre de cette passe** : TD-03 (CI, image, gabarit d'env).

## Fermée

| ID | Fermée le | Commit |
| --- | --- | --- |
| TD-01 | 2026-11-12 | `0f5d3dd` |
| TD-04 | 2026-11-12 | `31a6edc` |
| TD-05 | 2026-11-12 | `31a6edc` |
| TD-07 | 2026-11-12 | `31a6edc` |
| TD-08 | 2026-11-12 | `31a6edc` |
| TD-10 | 2026-11-12 | `31a6edc` |
| TD-12 | 2026-11-12 | `0f5d3dd` |
| TD-16 | 2026-11-12 | `edb7fa7` |
| TD-17 | 2026-11-12 | `6a11371` |
| TD-18 | 2026-11-12 | `44f5bc9` |
| TD-19 | 2026-11-12 | `31a6edc` |
| TD-20 | 2026-11-12 | `e390fcf` |
| TD-11 | 2026-11-12 | `05941a7` |
| TD-14 | 2026-11-12 | `d301f28` |
