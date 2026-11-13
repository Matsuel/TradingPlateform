# Dette technique

Registre de la dette connue, à corriger avant qu'elle ne grossisse. La règle qui l'alimente est dans [`AGENTS.md`](AGENTS.md#dette-technique). Audit initial du 2026-11-12 sur tout le dépôt (222 fichiers TypeScript hors `generated/` et `components/ui/`) ; les audits plus anciens (`audit/web.md`) restent des photos datées.

**Gravité** : `haute` = risque en production ou blocage d'un utilisateur ; `moyenne` = coût qui augmente à chaque feature ; `basse` = hygiène. **Effort** : S (< 2 h), M (< 1 jour), L (plus).

## Ouverte

| ID | Gravité | Zone | Dette | Où | Correction | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| TD-02 | basse | web | **Composants web : couverture partielle.** Services, consumers, routes HTTP, repositories (base `trading_test`), `KafkaConsumer`, middlewares, client de cours, hooks d'erreur et `ErrorState` sont testés. La plupart des composants partagés et des écrans de `COMPONENTS.md` n'ont pas de test (`Dash`, `StatCard`, `FilterTabs`, `EmptyCard` et `ErrorState` le sont). | `apps/web/src/{components,features}` | Un test par composant partagé restant (`DataTable`, champs de formulaire, `SymbolPicker`…) et par écran de feature. | M |
| TD-03 | basse | dépôt | **Pas d'image Docker.** La CI et un `.env.example` par app existent ; aucun `Dockerfile` n'est suivi, donc pas de déploiement reproductible. Prévu par la feature 22 de la roadmap. | racine | Une image par service (core-backend, market-service, backtest-engine, web), testée avec Docker. | M |
| TD-21 | basse | core-backend | **Limites de débit locales au process.** Les compteurs `express-rate-limit` sont en mémoire : avec plusieurs instances de core-backend, chaque instance compte à part (`TRUST_PROXY` règle déjà le cas d'un reverse proxy unique). | `core-backend/middleware/rate-limit.middleware.ts` | Un store partagé (Redis) quand l'API tourne en plusieurs instances (feature 22). | S |
| TD-23 | basse | backtest-engine | **Chaque exécution rappelle Yahoo.** Les cours d'un backtest ne sont pas mis en cache (l'empreinte `fingerprintPrices` hache les données, mais `fetchedAt` et la fraîcheur de la dernière clôture se perdraient). Un backtest relancé 10 fois fait 10 appels par symbole. | `market-service/services/market.service.ts` (`getDailyCloses`) | Cache des clôtures antérieures à la veille (immuables), publié avec le `fetchedAt` réel de la lecture. | M |
| TD-24 | basse | web | **TypeScript 6.0 dans le web seulement.** `typescript-eslint` ne supporte pas TypeScript 7 (`>=4.8.4 <6.1.0`) : le web reste en `~6.0.3`, le reste du dépôt en `^7`. | `apps/web/package.json` | Passer le web en `^7` quand `typescript-eslint` le supporte (issue typescript-eslint#10940). | S |
| TD-25 | basse | packages/kafka | **Avertissement `TimeoutNegativeWarning` au démarrage de chaque service Kafka.** kafkajs 2.2.4 calcule un délai négatif dans sa file de requêtes (`requestQueue/index.js:317`) sous Bun ; sans effet constaté (Bun ramène le délai à 1 ms) mais bruyant. | `node_modules/kafkajs` | Suivre une version de kafkajs ou de Bun qui le corrige ; sinon filtrer cet avertissement. | S |
| TD-27 | basse | web | **Règle métier côté web.** `hasDividendDetails` décide « rien à détailler » avec `dividendTotal > 0 || returnBreakdown.fx != null` : c'est au backend de dire si un résultat a des dividendes ou un effet de change (`AGENTS.md`, « Responsabilités »). | `apps/web/src/features/backtest/utils.ts` | Un drapeau dans le résultat, publié par l'engine et stocké en base ; le web ne fait que lire. | S |
| TD-31 | basse | web | **Page du lot sans vérification visuelle.** Le rendu n'a pas été comparé à la maquette 32 aux largeurs 375 à 1440 px ; la carte « Dates de départ » n'a pas de bouton pour retirer une date (absent de la maquette). | `apps/web/src/features/backtest/batch/backtest-batch.tsx`, `form/start-dates.tsx` | Mesurer le rendu contre Figma (`verifier-rendu`), faire dessiner le retrait d'une date | S |
| TD-35 | basse | tests | **Packages partagés sans test.** `packages/contracts`, `http` et `kafka` n'ont aucun fichier de test (l'authentification et le proxy de core-backend sont testés). | `packages/{contracts,http,kafka}` | Tests de schéma pour les contrats ; tests des erreurs HTTP et de la config Kafka. | M |

**Hors périmètre de cette passe** : TD-03 (CI, image, gabarit d'env). **Gardée volontairement** : TD-23 (cache des cours d'un backtest) tant que la provenance (`fetchedAt`) ne peut pas être publiée exacte.

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
| TD-22 | 2026-11-12 | `ec588af` |
| TD-26 | 2026-11-12 | `4289a50` |
| TD-28 | 2026-11-13 | `a045b8d` |
| TD-29 | 2026-11-13 | `f527181` |
| TD-32 | 2026-11-13 | `f527181` |
| TD-30 | 2026-11-13 | `ef551a9` |
| TD-33 | 2026-11-13 | `807b125` |
| TD-34 | 2026-11-13 | `2c0379e` |
| TD-36 | 2026-11-13 | `61a4cba` |
