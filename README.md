# MarketFlow — Distributed Exchange Simulator

> Plateforme de marché financier **simulée**, distribuée et pilotée par événements. Projet de mastère conçu pour démontrer des choix d’architecture, de fiabilité et d’exploitation — sans prétendre reproduire une bourse réelle ni fournir un conseil financier.

## Table des matières

- [Vision](#vision)
- [Périmètre et priorités](#périmètre-et-priorités)
- [Fonctionnalités](#fonctionnalités)
- [Architecture cible](#architecture-cible)
- [Modèle de données et source de vérité](#modèle-de-données-et-source-de-vérité)
- [Stack : quoi utiliser et quand](#stack--quoi-utiliser-et-quand)
- [Services et responsabilités](#services-et-responsabilités)
- [Cycle de vie d’un ordre](#cycle-de-vie-dun-ordre)
- [Matching engine et carnet d’ordres](#matching-engine-et-carnet-dordres)
- [Événements Kafka](#événements-kafka)
- [Données et stockages](#données-et-stockages)
- [API et temps réel](#api-et-temps-réel)
- [Portfolio Management Lab : portefeuille, risque et optimisation](#portfolio-management-lab--portefeuille-risque-et-optimisation)
- [Strategy Lab : DCA, backtest et paper trading](#strategy-lab--dca-backtest-et-paper-trading)
- [Simulation, bots et replay](#simulation-bots-et-replay)
- [Fiabilité, sécurité et observabilité](#fiabilité-sécurité-et-observabilité)
- [Tests et livraison](#tests-et-livraison)
- [Organisation du dépôt](#organisation-du-dépôt)
- [Roadmap annuelle](#roadmap-annuelle)
- [Définition de terminé](#définition-de-terminé)
- [Démo et soutenance](#démo-et-soutenance)
- [Risques et décisions à éviter](#risques-et-décisions-à-éviter)

## Vision

MarketFlow simule une place de marché : des utilisateurs et des agents automatisés envoient des ordres d’achat ou de vente ; un moteur de matching les exécute selon des règles déterministes ; les positions, le portefeuille et les données de marché sont mis à jour en temps réel.

Le but n’est pas de bâtir une plateforme de trading prête pour la production. Le but est de rendre démontrables, à une échelle maîtrisable, les propriétés d’une infrastructure de marché :

- traitement asynchrone et orienté événements ;
- ordre total et déterminisme là où cela est indispensable ;
- séparation entre données transactionnelles, données chaudes et analytique ;
- traçabilité d’un ordre de l’interface jusqu’à son exécution ;
- déploiement reproductible et observabilité exploitable.

### Objectifs pédagogiques

1. Concevoir un système où la cohérence d’un carnet d’ordres est prioritaire sur la distribution maximale.
2. Justifier l’usage de Kafka, PostgreSQL, Redis et ClickHouse par des besoins distincts.
3. Mettre en place une chaîne de livraison moderne : conteneurs, Kubernetes, Helm et GitOps.
4. Prouver le comportement par des tests, des métriques, des traces et une démonstration de panne maîtrisée.

### Hors périmètre

- argent réel, courtage, KYC/AML, fiscalité, conformité financière ou conservation d’actifs ;
- options, marge, liquidation, multi-devises, haute fréquence et latence microseconde ;
- microservices pour le principe : le MVP conserve peu de services et des frontières nettes.

## Périmètre et priorités

Les étiquettes suivantes évitent de sacrifier un projet fini à une architecture trop ambitieuse.

| Priorité | Sens |
| --- | --- |
| **MUST** | Indispensable au MVP et à la soutenance. |
| **SHOULD** | À faire une fois le MVP stable ; apporte une vraie valeur d’architecture. |
| **COULD** | Extension intéressante, seulement si le calendrier le permet. |

### MVP réaliste (MUST)

- Un marché simulé, avec **un seul instrument** (`ACME-EUR`) et une monnaie virtuelle (`EUR`).
- Comptes de démonstration, portefeuille virtuel et solde initial fixe.
- Ordres limités `BUY`/`SELL`, création et annulation.
- Carnet d’ordres centralisé par instrument, priorité prix-temps, exécutions partielles.
- Publication d’événements Kafka et projection de portefeuille transactionnelle.
- Interface Next.js : graphique simple, carnet, derniers échanges, portefeuille, formulaire d’ordre.
- Mises à jour WebSocket, Docker Compose local, tests essentiels et tableau Grafana de base.

### Après le MVP

- **SHOULD** : plusieurs instruments, bots, replay, ClickHouse, Kubernetes, Helm, CI/CD, OpenTelemetry et GitOps.
- **COULD** : MinIO, chaos engineering avancé, Keycloak, scénarios de backtesting complets, multi-région simulée.

## Fonctionnalités

| Domaine | MUST | SHOULD | COULD |
| --- | --- | --- | --- |
| Trading | Ordres limités, annulation, remplissages partiels | Ordres au marché, expiration, plusieurs instruments | Stop orders, auctions d’ouverture/clôture |
| Marché | Carnet L2, derniers trades, prix de référence | OHLCV et profondeur configurable | Indicateurs techniques |
| Portefeuille | Cash réservé, positions, P&L simple | P&L réalisé/non réalisé, historique | Risque et limites par compte |
| Strategy Lab | Backtest DCA historique, frais, comparaison DCA/investissement unique | Portefeuille virtuel planifié à partir d’aujourd’hui, plusieurs actifs, dividendes | Rééquilibrage et scénarios de crise personnalisés |
| Simulation | Prix initial et bots simples | Scénarios de volatilité, seed déterministe | Modèles statistiques plus riches |
| Exploitation | Logs, métriques et dashboard minimal | Traces distribuées, alertes | Chaos testing programmé |
| Déploiement | Compose local | Kubernetes + Helm + Argo CD | Environnement éphémère par PR |

## Architecture cible

Le front-end ne parle jamais directement au moteur de matching **ni à un fournisseur de données externe**. Il lit exclusivement les API et WebSockets de MarketFlow. Les commandes synchrones passent par une API ; les faits de marché circulent ensuite comme événements. Kafka est le journal d’intégration, pas une base de données ni un RPC déguisé.

```text
                       ┌────────────────────┐
                       │ Next.js / React UI │
                       └───────┬───────┬────┘
                    HTTPS/REST │       │ WebSocket
                               ▼       │
                  ┌────────────────────▼───────────────────┐
                  │ Core backend MarketFlow                 │
                  │ API • auth • portefeuilles • admin      │
                  │ consumers Kafka • projections • WS      │
                  └───┬───────────────┬───────────────┬─────┘
                      │               │               │
                 PostgreSQL         Redis          Kafka
                      │                               │ commandes/faits
                      │                    ┌──────────▼──────────┐
                      └───────────────────▶│ Matching engine      │
                                           │ carnet par instrument│
                                           └─────────────────────┘

     Job d’import optionnel ── Yahoo Finance/fichier ──▶ PostgreSQL
     Job de bots/replay optionnel ──────────────────────▶ Kafka
```

### Décision structurante

Un instrument doit être traité séquentiellement par **une seule instance logique** du matching engine. Pour le MVP, le plus simple est un seul moteur et un seul instrument. Plus tard, le partitionnement Kafka par `instrumentId` permet de répartir les instruments tout en conservant leur ordre interne. Ne cherchez pas à répartir le carnet d’un même instrument entre plusieurs consommateurs.

## Modèle de données et source de vérité

MarketFlow possède et persiste ses propres données. L’interface n’est pas une simple surcouche de Yahoo Finance : elle affiche le résultat des données écrites et projetées par **ta** plateforme.

| Donnée visible dans l’UI | Source de vérité MarketFlow | Mise à jour |
| --- | --- | --- |
| Compte, profil et droits | `users` / `accounts` dans PostgreSQL ; identité liée au `subject` JWT | Création/connexion et administration |
| Solde disponible et réservé | `ledger_entries` et projections `accounts` | Réservation, exécution, annulation |
| Portefeuille, positions et P&L | `positions` et `portfolio_snapshots` | `TradeExecuted` et cours de référence interne |
| Ordres et leur statut | `orders`, `order_executions`, `cash_reservations` | API, matching engine et projecteurs |
| Carnet, derniers trades et prix simulé | événements de marché + snapshot Redis/PostgreSQL | matching engine ; événements Kafka |
| Catalogue des instruments et fiche descriptive | `instruments`, `instrument_profiles` dans PostgreSQL | importeur de données de référence ou saisie administrateur |
| Historique de graphiques | `price_candles` dans PostgreSQL puis ClickHouse si nécessaire | importeur ou générateur de simulation |

### Yahoo Finance : rôle précis et optionnel

Yahoo Finance peut alimenter l’**importeur de données de référence**, par exemple pour rechercher `AAPL`, enregistrer son nom, son secteur, sa devise et importer des bougies historiques afin de proposer de jolis graphiques. Après import, l’application sert ces données depuis sa propre base et son cache.

Il ne doit ni gérer les comptes, ni détenir les portefeuilles, ni décider les exécutions, ni fournir directement l’état du carnet. Les prix d’exécution, les trades et les portefeuilles restent entièrement simulés et appartiennent à MarketFlow. Prévoir aussi un jeu de données local de démonstration : la démo reste fonctionnelle si le fournisseur externe est indisponible ou si ses conditions d’accès changent.

## Stack : quoi utiliser et quand

| Technologie | Rôle | Quand l’introduire | Alternative / décision |
| --- | --- | --- | --- |
| **Next.js + React + TypeScript** | UI, BFF léger, SSR éventuel | Dès le MVP | Choix unique pour le front ; ne pas ajouter une seconde API front inutile. |
| **Backend TypeScript (NestJS ou Fastify)** | API et services métier | MVP | Choisir NestJS si l’encadrement/modularité aide ; Fastify si l’on préfère minimalisme. Une seule base de code, packages séparés. |
| **Apache Kafka** | Commandes asynchrones, événements durables, replay | MVP, avec peu de topics | Redpanda est une alternative locale compatible Kafka. Ne pas ajouter Kafka Streams au MVP. |
| **PostgreSQL** | Source transactionnelle : comptes, ordres, ledger, déduplication | MVP | Source de vérité ; migrations versionnées. |
| **Redis** | Cache de snapshots, diffusion temps réel, rate limiting | MVP après le flux principal | Redis ne remplace ni PostgreSQL ni Kafka. |
| **ClickHouse** | Analytique des trades, OHLCV, dashboards historiques | SHOULD | Ne l’ajouter que lorsque les requêtes analytiques deviennent gênantes dans PostgreSQL. |
| **Docker / Docker Compose** | Environnement local reproductible | MVP | Premier environnement obligatoire avant Kubernetes. |
| **Kubernetes** | Orchestration et scalabilité démontrable | SHOULD | k3d/kind local ou cluster école ; ne pas le rendre prérequis au développement. |
| **Helm** | Packaging des manifests Kubernetes | SHOULD | Un chart par application/déploiement, valeurs par environnement. |
| **Argo CD** | Déploiement GitOps du cluster | SHOULD | Lit les manifests/valeurs Helm versionnés dans Git et synchronise le cluster ; il ne traite aucun ordre métier. |
| **Prometheus + Grafana** | Métriques, dashboards, alertes | MVP minimal puis SHOULD | Commencer par une dizaine de métriques utiles. |
| **OpenTelemetry + Tempo/Jaeger** | Traces de bout en bout | SHOULD | Ajouter après stabilisation des IDs de corrélation. |
| **MinIO** | Stockage objet de datasets, résultats de backtest, exports | COULD | Commencer avec le système de fichiers local en développement. |
| **Supabase Auth ou Keycloak** | Authentification et émission de JWT | Optionnel au MVP | Supabase Auth accélère le MVP ; Keycloak montre davantage IAM/self-hosted. En choisir un, pas les deux. |
| **Yahoo Finance (optionnel)** | Import de catalogue et d’historique de référence pour la recherche/les graphiques | SHOULD, après le MVP métier | Accès via un adaptateur côté serveur, cache local et dataset de secours ; jamais directement depuis l’UI. |

## Services et responsabilités

Le MVP ne comporte que **trois déploiements**. Le backend est un monolithe modulaire : plus rapide à construire, plus facile à déboguer, tout en gardant Kafka et le matching engine séparés là où la frontière apporte une vraie valeur.

| Déploiement | Priorité | Responsabilité | Modules internes / dépendances |
| --- | --- | --- | --- |
| `web` | MUST | Pages connexion, portefeuilles, recherche, fiche actif, Strategy Lab et administration | Next.js ; REST + WebSocket du backend |
| `core-backend` | MUST | Toute l’application métier hors matching : API, autorisation, portefeuilles, ordres, ledger, catalogue, Strategy Lab, admin, logs métier, WebSocket et projections Kafka | Modules `auth`, `portfolio`, `orders`, `market-data`, `instruments`, `strategy-lab`, `admin` ; PostgreSQL, Redis, Kafka |
| `matching-engine` | MUST | Consomme les commandes ordonnées, maintient les carnets et produit les événements d’ordre/trade | Kafka ; snapshot de récupération PostgreSQL au départ |

Les éléments suivants ne sont **pas** des services permanents :

| Job / module | Priorité | Rôle |
| --- | --- | --- |
| `reference-data-import` | SHOULD | Commande planifiée ou manuelle qui importe instruments, informations et bougies dans PostgreSQL. |
| `strategy-scheduler` | SHOULD | Déclenche les échéances des stratégies de paper trading ; le calcul reste dans le module `strategy-lab`. |
| `market-bots` | SHOULD | Module/worker lancé pour une session de simulation ; utilise les mêmes commandes que les utilisateurs. |
| `replay` | SHOULD | Commande de maintenance qui rejoue un scénario isolé. |
| `analytics-export` | COULD | Consumer déclenché seulement lorsque ClickHouse est réellement introduit. |

Ainsi, `portfolio-projector`, `market-data-projector`, `analytics-projector`, `risk-service` et `api-gateway` **ne sont pas des microservices séparés**. Les deux premiers sont des consumers/modules du `core-backend`; l’analytique et le risque restent des extensions futures. PostgreSQL, Redis et Kafka sont des dépendances d’infrastructure, pas des services métier supplémentaires à développer.

## Cycle de vie d’un ordre

```text
1. UI -> POST /v1/orders (JWT + Idempotency-Key)
2. API : valide format, compte, solde disponible ; crée l’ordre PENDING et une réservation
3. API -> Kafka : order.commands.v1 (clé = instrumentId)
4. Matching : consomme en ordre, accepte/rejette, matche et publie les faits
5. `core-backend` consomme les faits idempotemment et met à jour portefeuille, historique, cache de marché et vues d’administration
6. API/WS : le client reçoit `order.updated`, trade et snapshot du carnet
```

L’API répond **`202 Accepted`** après persistance de la commande et publication fiable ; l’état final se lit via `GET /v1/orders/{id}` ou les événements WebSocket. Cette réponse asynchrone est volontaire : une exécution peut être partielle et plusieurs événements peuvent suivre.

### Transactional outbox

Éviter le double problème « ligne écrite en base mais message non publié » : dans une transaction PostgreSQL, créer l’ordre/réservation **et** une ligne `outbox`. Un relay publie ensuite cette ligne vers Kafka puis la marque comme publiée. C’est plus réaliste qu’une prétendue transaction distribuée PostgreSQL–Kafka.

## Matching engine et carnet d’ordres

### Pourquoi ce service existe

Le matching engine est le composant qui transforme des intentions d’achat et de vente en un **marché simulé**. Sans lui, le `core-backend` saurait enregistrer deux ordres, par exemple « acheter 10 AAPL à 150 € » et « vendre 10 AAPL à 149 € », mais il ne saurait pas décider automatiquement qu’ils doivent être exécutés ensemble, dans quel ordre et à quel prix.

Son rôle est strictement limité à la mécanique de marché :

- comparer l’ordre reçu aux ordres opposés du carnet ;
- appliquer la priorité prix-temps ;
- déterminer le prix et la quantité de chaque exécution ;
- laisser un reliquat dans le carnet si l’ordre est partiellement rempli ;
- publier les faits obtenus : `OrderAccepted`, `OrderPartiallyFilled`, `OrderFilled`, `OrderCancelled` et `TradeExecuted`.

Il ne gère **ni** les utilisateurs, **ni** les portefeuilles, **ni** le cash, **ni** l’interface. Il ne modifie pas les tables PostgreSQL métier (`accounts`, `orders`, `positions`, `ledger_entries`). Il peut uniquement conserver un snapshot technique de **son propre carnet** pour accélérer un redémarrage.

```text
core-backend ── OrderSubmitted ──▶ Kafka ──▶ matching-engine
                                                  │
                                      compare au carnet et décide
                                                  │
core-backend ◀─ TradeExecuted / OrderFilled ─ Kafka ◀┘
      │
      └── met à jour PostgreSQL : ordre, cash, positions, historique et UI
```

Cette séparation est utile pour le projet : le backend général reste simple et centré sur les utilisateurs, tandis que le matching engine est isolé, déterministe, testable et peut conserver l’ordre par instrument. Pour une application beaucoup plus petite, ce code pourrait vivre dans le backend ; ici, le séparer donne du sens à Kafka et met en valeur le cœur d’une bourse.

### Règles MVP

- Types autorisés : ordre limite uniquement ; `side ∈ {BUY, SELL}` ; `quantity > 0` ; `price > 0`.
- Priorité **prix puis temps** : meilleur prix d’abord ; à prix égal, le premier ordre accepté est servi d’abord.
- Un achat limite croise les asks dont le prix est inférieur ou égal à son prix ; une vente limite croise les bids supérieurs ou égaux.
- Le prix d’exécution est celui de l’ordre déjà présent dans le carnet (« maker »).
- Un ordre non totalement exécuté reste ouvert dans le carnet ; une annulation ne concerne que son reliquat.
- Tous les montants sont des entiers : `priceTicks`, `quantityLots`, jamais des `float`.

### Modèle en mémoire

Pour chaque `instrumentId` :

- `bids` : niveaux de prix décroissants ; file FIFO par prix ;
- `asks` : niveaux de prix croissants ; file FIFO par prix ;
- index `orderId -> emplacement` pour une annulation efficace ;
- séquence monotone `marketSequence` par instrument, incluse dans les événements.

Le moteur applique une commande, produit tous les événements résultants, puis passe à la suivante. Sa reprise peut d’abord recharger un snapshot du carnet et les événements ultérieurs. Le replay complet depuis Kafka est une extension : prévoir les identifiants et séquences dès le MVP, sans devoir implémenter l’event sourcing intégral immédiatement.

### Invariants à tester

- aucune quantité négative, aucun ordre à quantité nulle dans le carnet ;
- meilleur bid strictement inférieur au meilleur ask après traitement (hors instant interne d’un match) ;
- conservation : quantité initiale = quantité exécutée + annulée + ouverte ;
- aucune exécution sans deux ordres compatibles ;
- mêmes commandes ordonnées + même seed = mêmes événements.

## Événements Kafka

### Conventions

- Nom : `<domaine>.<fait-ou-commande>.v1` ; version explicite et compatible.
- Enveloppe commune : `eventId`, `eventType`, `occurredAt`, `correlationId`, `causationId`, `producer`, `schemaVersion`, `payload`.
- Clé Kafka : `instrumentId` pour la séquence du matching ; `accountId` pour les événements de portefeuille. Ne pas changer la clé sans analyser l’impact sur l’ordre.
- Format : JSON validé avec JSON Schema au MVP ; Avro/Protobuf + Schema Registry seulement si le volume d’équipes/consommateurs le justifie.

### Topics initiaux

| Topic | Producteur | Consommateurs | Clé | Rétention indicative |
| --- | --- | --- | --- | --- |
| `order.commands.v1` | `core-backend` | `matching-engine` | `instrumentId` | 7 jours |
| `order.events.v1` | `matching-engine` | `core-backend` | `instrumentId` | 30 jours |
| `trade.events.v1` | `matching-engine` | `core-backend` | `instrumentId` | 30 jours |
| `portfolio.events.v1` | `core-backend` | `core-backend` (WebSocket/vues) | `accountId` | 30 jours |
| `marketdata.events.v1` | `core-backend` | `core-backend` (WebSocket/vues) | `instrumentId` | 7 jours |
| `dead-letter.v1` | Tous via mécanisme contrôlé | Opérateur | clé d’origine | 30 jours |

Les durées sont des choix de démonstration à ajuster selon la capacité du cluster. Elles ne remplacent pas une politique de sauvegarde.

### Exemple : commande d’ordre

```json
{
  "eventId": "01J…",
  "eventType": "OrderSubmitted",
  "schemaVersion": 1,
  "occurredAt": "2026-09-29T10:15:30.123Z",
  "correlationId": "01J…",
  "causationId": "01J…",
  "producer": "api-gateway",
  "payload": {
    "orderId": "01J…",
    "accountId": "01J…",
    "instrumentId": "ACME-EUR",
    "side": "BUY",
    "type": "LIMIT",
    "priceTicks": 15242,
    "quantityLots": 50,
    "submittedAt": "2026-09-29T10:15:30.121Z"
  }
}
```

### Exemple : exécution

```json
{
  "eventId": "01J…",
  "eventType": "TradeExecuted",
  "schemaVersion": 1,
  "occurredAt": "2026-09-29T10:15:30.198Z",
  "correlationId": "01J…",
  "causationId": "01J…",
  "producer": "matching-engine",
  "payload": {
    "tradeId": "01J…",
    "instrumentId": "ACME-EUR",
    "marketSequence": 481,
    "makerOrderId": "01J…",
    "takerOrderId": "01J…",
    "buyAccountId": "01J…",
    "sellAccountId": "01J…",
    "priceTicks": 15240,
    "quantityLots": 20
  }
}
```

### Ordre, doublons et erreurs

- Kafka garantit l’ordre **dans une partition**, pas sur tout le cluster. La clé `instrumentId` est donc non négociable pour le matching.
- Configurer un producteur idempotent et `acks=all` pour les événements métier. Cela réduit les doublons de publication, mais ne donne pas une garantie « exactly once » globale.
- Chaque consommateur stocke les `eventId` déjà appliqués ou applique les événements avec une contrainte unique transactionnelle. Le traitement doit être **at-least-once et idempotent**.
- Une erreur non récupérable part dans une DLQ avec l’événement original, l’erreur et le nombre de tentatives ; elle n’est jamais ignorée silencieusement.

## Données et stockages

| Stockage | Données | Pourquoi |
| --- | --- | --- |
| **PostgreSQL** | comptes, identité locale, ordres, réservations, ledger immuable, positions, outbox, déduplication, snapshots | transactions, contraintes et audit métier |
| **Redis** | meilleur bid/ask, snapshot de carnet, sessions/limites, cache de vues | lecture rapide et diffusion, données reconstructibles |
| **Kafka** | commandes et faits intégrés entre services | journal durable, découplage et replay borné |
| **ClickHouse** | trades, chandeliers, volumes, statistiques historiques | scans/agrégations analytiques rapides |
| **MinIO (option)** | exports et jeux de données de replay/backtest | objets volumineux, non transactionnels |

### Tables PostgreSQL minimales

- `accounts(id, cash_available, cash_reserved, ...)`
- `orders(id, account_id, instrument_id, side, limit_price_ticks, initial_qty, open_qty, status, ...)`
- `cash_reservations(id, order_id, amount_ticks, status, ...)`
- `ledger_entries(id, account_id, event_id, kind, amount_ticks, created_at, ...)`
- `positions(account_id, instrument_id, quantity_lots, average_cost_ticks, ...)`
- `instruments(id, symbol, name, exchange, currency, status, ...)`
- `instrument_profiles(instrument_id, sector, description, logo_url, source, refreshed_at, ...)`
- `price_candles(instrument_id, interval, opened_at, open_ticks, high_ticks, low_ticks, close_ticks, volume, source, ...)`
- `trades(id, instrument_id, market_sequence, price_ticks, quantity_lots, executed_at, ...)`
- `order_executions(order_id, trade_id, quantity_lots, price_ticks, ...)`
- `strategies(id, account_id, name, mode, instrument_id, initial_cash_ticks, contribution_ticks, frequency, fee_bps, execution_rule, ...)`
- `simulation_runs(id, strategy_id, started_at, period_start, period_end, data_version, status, summary_json, ...)`
- `simulation_transactions(id, simulation_run_id, scheduled_at, executed_at, price_ticks, quantity_lots, fee_ticks, kind, ...)`
- `virtual_portfolios(id, account_id, strategy_id, cash_available_ticks, status, ...)`
- `outbox(id, topic, key, payload, published_at, ...)`
- `processed_events(consumer_name, event_id, processed_at)`

Le ledger est append-only ; les positions et soldes sont des projections pratiques. Ne pas modifier un mouvement comptable existant : ajouter une écriture de correction.

## API et temps réel

### REST MVP

| Méthode | Route | Usage |
| --- | --- | --- |
| `POST` | `/v1/orders` | Soumet un ordre ; accepte `Idempotency-Key`. |
| `DELETE` | `/v1/orders/{orderId}` | Demande l’annulation d’un ordre ouvert. |
| `GET` | `/v1/orders/{orderId}` | Lit le statut courant. |
| `GET` | `/v1/markets/{instrumentId}/order-book` | Snapshot cohérent du carnet. |
| `GET` | `/v1/markets/{instrumentId}/trades` | Derniers échanges. |
| `GET` | `/v1/portfolio` | Cash, positions, P&L. |
| `GET` | `/v1/instruments?query=apple` | Recherche dans le catalogue **stocké par MarketFlow**. |
| `GET` | `/v1/instruments/{instrumentId}` | Fiche instrument, informations et provenance de référence. |
| `GET` | `/v1/instruments/{instrumentId}/candles?interval=1d` | Bougies historiques depuis la base MarketFlow. |
| `POST` | `/v1/strategies/backtests` | Crée et lance un backtest DCA historique. |
| `GET` | `/v1/backtests/{runId}` | Résultat, séries graphiques et transactions simulées d’un backtest. |
| `POST` | `/v1/strategies` | Crée une stratégie de paper trading à partir d’aujourd’hui. |
| `GET` | `/v1/strategies` | Liste les stratégies et leurs portefeuilles virtuels. |

Documenter avec OpenAPI et générer le client TypeScript pour le front. Les erreurs doivent être structurées (`code`, `message`, `correlationId`) ; exposer le `correlationId` facilite une investigation à la soutenance.

### WebSocket

Canal unique `/v1/ws`, authentifié lors de la connexion. Le client s’abonne à :

```json
{ "action": "subscribe", "channels": ["book:ACME-EUR", "trades:ACME-EUR", "portfolio"] }
```

Chaque message de carnet contient `marketSequence`. À la reconnexion, le client récupère un snapshot REST, puis ignore les deltas antérieurs ou égaux à cette séquence. Prévoir heartbeat, limites de souscription et backpressure (un client lent reçoit un nouveau snapshot plutôt qu’une file infinie).


## Portfolio Management Lab : portefeuille, risque et optimisation

Le projet évolue progressivement d'un simulateur de marché vers un **laboratoire pédagogique de gestion de portefeuille**. L'objectif n'est pas de remplacer une plateforme professionnelle, mais de comprendre concrètement comment une stratégie d'investissement se comporte selon différentes périodes historiques, différents niveaux de risque et différentes allocations.

### Principe central

Un portefeuille fictif part d'un capital donné, par exemple `100 000 €`, reçoit une allocation entre plusieurs actifs, puis est simulé sur des données historiques.

Exemple :

```text
Capital initial : 100 000 €
Allocation       : 60 % actions / 30 % obligations / 10 % cash
Période           : 2000 → 2026
Rebalancement     : annuel
Frais              : configurables
```

Le système doit permettre de déplacer la période de départ :

```text
1990 → 2026
2000 → 2026
2010 → 2026
2015 → 2026
2020 → 2026
```

Cela permet d'observer comment **la même stratégie** se comporte lorsqu'elle démarre dans des environnements de marché différents.

### V1 : moteur de portefeuille et backtest

La première version du Portfolio Management Lab doit permettre de :

- définir plusieurs actifs et leurs poids ;
- définir un capital initial ;
- choisir une date de début et une date de fin ;
- choisir une fréquence de rebalancement ;
- configurer les frais ;
- simuler les achats et ventes nécessaires au rebalancement ;
- calculer la valeur quotidienne du portefeuille ;
- comparer le portefeuille à un benchmark ;
- comparer plusieurs dates de départ ;
- afficher la courbe de capital ;
- afficher la courbe de drawdown ;
- conserver toutes les transactions simulées.

### Métriques minimales

Chaque simulation doit calculer au minimum :

| Métrique | Question |
| --- | --- |
| Valeur finale | Combien vaut le portefeuille à la fin ? |
| P&L | Combien a été gagné/perdu ? |
| Rendement annualisé / CAGR | Quel a été le rythme de croissance annuel composé ? |
| Volatilité | À quel point la valeur du portefeuille fluctue-t-elle ? |
| Max drawdown | Quelle a été la plus grosse perte depuis un plus-haut ? |
| Durée de récupération | Combien de temps a-t-il fallu pour retrouver le précédent plus-haut ? |
| Sharpe ratio | Quel rendement a été obtenu par rapport à la volatilité prise ? |
| Benchmark | La stratégie a-t-elle fait mieux ou moins bien qu'une référence ? |

Les métriques doivent toujours être accompagnées de leur période, de la devise, des frais et de la configuration de simulation.

### Comparaison de portefeuilles

L'interface doit permettre de comparer par exemple :

```text
Portfolio A
70 % actions
20 % obligations
10 % cash

Portfolio B
60 % actions
30 % obligations
10 % cash
```

Puis d'afficher côte à côte :

```text
                    Portfolio A    Portfolio B
Rendement annuel        7,8 %          6,5 %
Volatilité              11,2 %          9,1 %
Max drawdown           -17,0 %        -13,0 %
Sharpe                   0,72           0,70
```

Les valeurs ci-dessus sont uniquement illustratives.

L'objectif pédagogique est de comprendre le compromis entre **rendement potentiel et risque**, et non de rechercher une performance historique maximale sans tenir compte du risque.

### V2 : Risk Engine

Une fois le backtest fiable, ajouter un moteur de risque indépendant du moteur de simulation.

Il devra notamment pouvoir calculer :

- volatilité ;
- max drawdown ;
- Sharpe ;
- corrélations entre actifs ;
- exposition par actif, secteur, zone géographique ou autre classification disponible ;
- concentration ;
- VaR historique en extension ;
- CVaR en extension ;
- contribution au risque en extension.

Le système doit pouvoir répondre à des contraintes telles que :

```text
Capital : 100 000 €
Drawdown cible : <= 15 %
```

Le résultat doit montrer **si la stratégie historique respecte ou non la contrainte**, sans présenter cette contrainte comme une garantie pour le futur.

### V3 : Portfolio Optimizer

Après validation du Risk Engine, ajouter une optimisation sous contraintes.

Exemples de contraintes :

```text
100 % du capital investi
0 % <= poids actif <= 50 %
Cash >= 5 %
Actions <= 80 %
Objectif : maximiser le rendement historique ajusté du risque
```

Puis, dans une version plus avancée :

```text
Objectif :
trouver une allocation satisfaisant un niveau de risque cible
tout en maximisant une métrique choisie.
```

Les optimisations doivent toujours être testées sur une période différente de celle utilisée pour choisir les paramètres afin de limiter le **surapprentissage**.

#### Explorateur d'allocations

Première forme concrète de l'optimiseur : à partir d'un panier choisi par l'utilisateur (par exemple `AAPL` + `MSFT`), tester automatiquement de nombreuses répartitions et montrer laquelle a offert le meilleur compromis rendement/risque.

L'objectif n'est **jamais** « maximiser le rendement passé » : sans contrainte, la réponse serait toujours 100 % sur l'actif qui a le plus monté. Les objectifs proposés sont ajustés du risque :

| Objectif | Question |
| --- | --- |
| Max Sharpe | Quel mix offre le meilleur rendement par unité de volatilité ? |
| Min variance | Quel mix fluctue le moins ? |
| Risk parity | Quel mix fait contribuer chaque actif autant au risque ? |
| Rendement sous contrainte | Quel mix rapporte le plus avec, par exemple, un drawdown ≤ 20 % ? |

Fonctionnement :

```text
1. Balayage   : grille de poids (pas de 5 %) → un backtest par mix, calculé dans backtest-engine
2. Frontière  : chaque mix placé sur un graphe volatilité / rendement (frontière efficiente)
3. Validation : allocation choisie sur la période d'apprentissage (ex. 2010 → 2018),
                rejouée sur la période de test (ex. 2019 → 2025) et comparée au mix équipondéré
4. Robustesse : même optimisation sur plusieurs dates de départ ; une allocation instable est signalée
```

Prérequis dans le moteur actuel : poids par actif dans `backtest.requested`, rebalancement périodique (sinon l'allocation dérive), et métriques CAGR, volatilité et Sharpe.

Le résultat est formulé au passé (« ce mix **aurait** offert… ») avec sa performance hors échantillon face au mix équipondéré. Si l'allocation optimisée ne bat pas ce mix naïf sur la période de test, l'interface le dit explicitement.

### V4 : profils de clients fictifs

Créer plusieurs profils pédagogiques :

```text
Client prudent
- faible tolérance au drawdown
- horizon long
- objectif de stabilité

Client équilibré
- compromis rendement/risque

Client dynamique
- accepte davantage de volatilité
- recherche davantage de croissance
```

Chaque profil possède des contraintes différentes.

Le système doit montrer :

```text
Profil
   ↓
Contraintes
   ↓
Allocation candidate
   ↓
Backtest
   ↓
Risk Engine
   ↓
Rapport
```

Ces profils sont fictifs et ne constituent pas une fonctionnalité de conseil financier réel.

### V5 : reporting gestionnaire

Générer un rapport lisible contenant :

- allocation actuelle ;
- performance ;
- benchmark ;
- risque ;
- drawdown ;
- principales contributions à la performance ;
- historique des décisions ;
- transactions ;
- évolution de l'allocation ;
- commentaires générés à partir de données mesurées.

Le rapport doit permettre de répondre simplement à :

> « Qu'est-ce qui s'est passé avec ce portefeuille et quel risque a été pris pour obtenir cette performance ? »

### V6 : paper trading

Une fois les simulations historiques fiables, permettre de lancer une stratégie **à partir d'aujourd'hui** avec de l'argent virtuel.

Le portefeuille virtuel doit ensuite évoluer avec les nouvelles données disponibles.

Distinction importante :

```text
BACKTEST
"Qu'aurait donné cette stratégie dans le passé ?"

PAPER TRADING
"Que donne cette stratégie à partir de maintenant ?"
```

Le second ne prédit pas le futur : il mesure uniquement ce qui se passe après le lancement.

### Extensions d'analyse

Ces analyses complètent le backtest sans le remplacer. Tous les calculs vivent dans `backtest-engine/engine/` ; le web ne fait qu'afficher.

#### Métriques glissantes

Un backtest donne un seul résultat pour une seule date d'entrée. Les métriques glissantes calculent le rendement, la volatilité et le drawdown sur **toutes les fenêtres** d'une durée donnée (1, 3 ou 5 ans) contenues dans la période.

Question traitée :

> « Dans le pire des cas, combien un investisseur entré au mauvais moment a-t-il perdu sur 3 ans ? »

Affichage : courbe du rendement glissant et distribution (pire, médiane, meilleure fenêtre, part des fenêtres négatives).

#### Projection Monte Carlo

Le backtest raconte **le** passé ; la projection Monte Carlo montre **les** futurs plausibles construits à partir de ce passé :

```text
1. Rendements journaliers historiques de l'allocation (sur la période choisie)
2. Construction d'une trajectoire future en tirant ces rendements au hasard (bootstrap par blocs,
   pour conserver une partie de l'enchaînement des jours)
3. Répétition sur 10 000 trajectoires
4. Lecture de la distribution : percentiles 10 / 50 / 90, probabilité de perte, valeur finale
```

- Affichage en **fan chart** : médiane et bandes de percentiles dans le temps.
- La simulation prend une **seed** explicite : même seed et mêmes entrées donnent le même résultat, ce qui rend le moteur testable.
- Limite à afficher : les scénarios ne contiennent que des rendements déjà observés ; une crise plus grave que l'historique n'y figure pas.

Le même moteur servira plus tard au pricing de produits structurés (moyenne actualisée des gains sur des trajectoires simulées).

#### Objectif financier et taux de retrait

Extension de la projection Monte Carlo : des flux sont ajoutés à chaque trajectoire simulée.

```text
Retrait   : 300 000 €, retrait de 1 200 €/mois pendant 30 ans
            → probabilité que le capital ne soit jamais épuisé
Objectif  : atteindre 100 000 € en 15 ans
            → versement mensuel nécessaire pour 80 % de probabilité de succès
```

Le résultat est une probabilité calculée sur des scénarios historiques, jamais une promesse.

#### Effet devise

Un investisseur en euros qui détient une action cotée en dollars subit aussi la variation EUR/USD. L'analyse convertit chaque cours dans la devise de l'investisseur avec le taux de change du jour et compare :

```text
Rendement de l'actif en devise locale (USD)
Rendement vu par l'investisseur (EUR)
Contribution du change = différence entre les deux
```

Il s'agit uniquement d'une conversion analytique des historiques : les comptes, le ledger et le marché simulé restent mono-devise (`EUR`), conformément au hors périmètre.

### Principes de validité des backtests

Le moteur de backtest doit explicitement lutter contre les biais classiques.

#### Look-ahead bias

Ne jamais utiliser une information qui n'était pas disponible au moment de la décision.

Exemple : si la décision est prise avant l'ouverture, ne pas exécuter artificiellement au cours de clôture connu plus tard.

Le MVP doit utiliser une règle explicite d'exécution, par exemple :

```text
Décision à la date T
→ exécution au prochain prix d'ouverture disponible
```

#### Survivorship bias

Éviter de tester une stratégie historique uniquement avec les actifs qui existent encore aujourd'hui.

À terme, conserver la provenance et la version du dataset utilisé et documenter les limites de l'univers historique.

#### Data snooping / overfitting

Ne pas choisir une stratégie uniquement parce qu'elle donne le meilleur résultat sur la période utilisée pour la concevoir.

Prévoir à terme une séparation :

```text
Période de développement
        ↓
Période de validation
        ↓
Période hors échantillon
```

#### Frais et hypothèses

Les simulations doivent rendre visibles :

- frais de transaction ;
- hypothèses de slippage si utilisées ;
- dividendes ;
- splits ;
- fréquence de rebalancement ;
- règle d'exécution ;
- devise ;
- source et version des données.

### Inspirations externes

Le projet peut s'inspirer des fonctionnalités de plateformes publiques comme :

- **Portfolio Visualizer** : analyse et backtest de portefeuilles ;
- **QuantConnect** : backtesting et analyse de stratégies programmatiques.

Ces plateformes servent de **références fonctionnelles**. MarketFlow ne cherche pas à les copier ; l'objectif est de construire une version cohérente avec les objectifs pédagogiques du projet et l'architecture distribuée déjà prévue.

### Ordre de développement recommandé

Ne pas commencer par l'optimisation ou Kubernetes.

```text
1. Données historiques fiables
        ↓
2. Portefeuille simple
        ↓
3. Backtest reproductible
        ↓
4. Métriques de performance
        ↓
5. Comparaison de dates de départ
        ↓
6. Risk Engine
        ↓
7. Optimisation sous contraintes
        ↓
8. Profils de clients fictifs
        ↓
9. Reporting
        ↓
10. Paper trading
        ↓
11. Architecture distribuée avancée
```

Le **backtest est la priorité absolue** : tant que son résultat n'est pas reproductible, explicable et correctement testé, il ne faut pas construire l'optimiseur au-dessus.


## Strategy Lab : DCA, backtest et paper trading

Le **Strategy Lab** est la fonctionnalité qui différencie MarketFlow d’un simple tableau de trading. Il permet à une personne qui hésite à investir de tester une règle simple sur une période passée, puis de l’observer avec de l’argent virtuel à partir d’aujourd’hui. Il s’agit d’un outil pédagogique : aucun résultat historique ne constitue une prédiction ou un conseil d’investissement.

### Deux modes complémentaires

| Mode | Question répondue | Données et exécution | Matching engine |
| --- | --- | --- | --- |
| **Backtest historique** | « Qu’aurait donné 100 € par mois sur cet actif entre deux dates passées ? » | Bougies historiques persistées dans MarketFlow ; calcul déterministe et reproductible | **Non** : une exécution synthétique est plus honnête qu’un carnet fictif dans le passé |
| **Paper trading futur** | « Que se passe-t-il si je commence cette stratégie maintenant ? » | Stratégie planifiée, portefeuille virtuel et nouvelles données au fil du temps | **Optionnel** : oui si la stratégie envoie un ordre au marché simulé ; non si elle suit un cours de référence |

### MVP : backtest DCA simple

L’utilisateur choisit un instrument, une date de début et de fin, un apport initial éventuel, un montant périodique, une fréquence mensuelle et des frais. Exemple : « investir 100 € le premier jour de bourse de chaque mois sur `AAPL` entre janvier 2018 et janvier 2025 ».

Le module `strategy-lab` vit dans le `core-backend`; ce n’est pas un microservice supplémentaire. Il :

1. valide les paramètres et fige la version des données de marché utilisées ;
2. aligne chaque échéance sur le prochain jour de bourse disponible ;
3. exécute l’achat simulé au **prochain prix d’ouverture disponible** et applique les frais ;
4. enregistre chaque mouvement dans `simulation_transactions` ;
5. calcule la valeur du portefeuille et les métriques ;
6. retourne une série exploitable par le graphique et un rapport lisible.

La règle « prochain prix d’ouverture » évite d’utiliser un prix de clôture qui n’était pas encore connu au moment de la décision : c’est une protection simple contre le biais de regard vers le futur (*look-ahead bias*).

### Résultats affichés dans l’UI

- montant total versé, frais et valeur finale ;
- gain/perte et rendement, clairement datés ;
- quantité d’actifs accumulée ;
- courbe de valeur du portefeuille et courbe du prix de l’actif ;
- liste de tous les achats simulés ;
- comparaison avec un investissement unique effectué à la date de départ ;
- perte maximale observée (*max drawdown*) et durée de récupération, en extension.

Le graphique doit toujours afficher la période, la devise, les frais, la règle d’exécution et la source/version des données. Cela rend le résultat explicable, plutôt qu’un chiffre magique.

### Paper trading à partir d’aujourd’hui (SHOULD)

Une stratégie active, par exemple « 100 € chaque premier lundi du mois », crée un portefeuille virtuel distinct. Un job planifié détecte les échéances, crée une transaction ou un ordre virtuel, puis le `core-backend` met à jour le portefeuille. L’utilisateur voit au fil du temps les décisions réalisées et leur valeur avec les nouvelles données.

Pour éviter une ambiguïté : ce mode mesure le résultat **après** le lancement de la stratégie ; il ne prédit jamais le prix futur. Si les achats doivent interagir avec le carnet et les bots MarketFlow, ils passent alors par Kafka et le matching engine comme les autres ordres. Si l’objectif est seulement de suivre une stratégie DCA sur un cours de référence, une exécution synthétique suffit.

### Limites à rendre visibles

- Les données historiques peuvent contenir des ajustements de split ou dividende : leur traitement doit être déclaré et testé avant d’être activé.
- Le MVP utilise une fréquence mensuelle, un actif et des bougies journalières ; pas de stratégie intraday ni d’optimisation automatique.
- Les frais, la fiscalité, la liquidité et le slippage réel ne sont pas connus avec précision ; le MVP ne simule que les frais configurés.
- L’UI affiche : « Les performances passées ne préjugent pas des performances futures. Simulation pédagogique, pas un conseil en investissement. »

## Simulation, bots et replay

### Simulation de marché

Ne pas commencer par un modèle quantitatif sophistiqué. Un générateur déterministe suffit : une marche aléatoire bornée autour d’un prix de référence, plus deux bots qui déposent de la liquidité de part et d’autre.

- **Market maker simple** : place régulièrement un bid et un ask autour du prix de référence ; annule/remplace les ordres trop anciens.
- **Noise trader** : envoie de petits ordres limites avec une fréquence et une direction pseudo-aléatoires.
- **Scénario** : une graine (`seed`) et une configuration versionnée rendent une session rejouable.

Les bots utilisent exactement la même API ou le même topic de commande que les utilisateurs : pas de raccourci caché vers le carnet.

### Backtesting et replay (SHOULD)

1. Exporter ou conserver une séquence d’événements de marché et une configuration de scénario.
2. Créer un `replayId` et rejouer les événements dans des topics dédiés, par exemple `replay.<replayId>.trade.events.v1`.
3. Permettre une vitesse `0.5x`, `1x`, `10x` et un mode pas-à-pas.
4. Écrire les résultats (P&L, drawdown simplifié, nombre d’ordres) dans ClickHouse ou MinIO.

Ne jamais rejouer dans les topics de production/démonstration sans préfixe et isolation explicite.

## Fiabilité, sécurité et observabilité

### Résilience

- Timeouts, retries bornés avec backoff et circuit breaker seulement aux frontières réseau.
- Consumers relançables : offsets validés uniquement après écriture idempotente réussie.
- Health checks : `liveness` (processus vivant) et `readiness` (prêt à consommer/servir), distincts.
- Sauvegardes PostgreSQL et procédure de restauration testée, même sur petit environnement.
- Snapshot régulier du carnet, avec checksum et séquence, pour réduire le temps de reprise.

### Chaos testing (COULD, puis SHOULD si temps)

Commencer par des tests reproductibles en environnement de démo : arrêter un projecteur, couper temporairement Kafka ou tuer le matching engine. Pour chaque test, annoncer l’hypothèse, la métrique attendue, le mécanisme de reprise et le résultat. Chaos Mesh/Litmus n’est utile qu’après ces scénarios simples ; il ne faut pas l’installer « pour cocher une case ».

### Observabilité

Chaque requête et événement transporte `correlationId`; chaque log est JSON et inclut au minimum `service`, `level`, `eventId` si présent et `correlationId`.

Métriques Prometheus initiales :

- latence et taux d’erreur HTTP ;
- profondeur/lag des consumer groups Kafka ;
- ordres reçus, rejetés, ouverts et exécutés ;
- temps de traitement du matching ;
- taille du carnet, nombre de connexions WebSocket ;
- outbox en attente et taux d’échecs de projection.

**SHOULD** : instrumentation OpenTelemetry de l’API aux consommateurs ; exporter les traces vers Tempo ou Jaeger et lier métriques, logs et traces via les mêmes identifiants.

### Sécurité

- HTTPS en environnement exposé ; secrets hors du dépôt (variables/secret manager Kubernetes).
- JWT signés et vérifiés par l’API ; autorisation systématique : un compte ne lit/modifie que ses ressources.
- Validation stricte de tous les payloads, limites de taille, rate limiting sur la soumission et le WebSocket.
- CORS restrictif, dépendances scannées, images conteneur non-root et minimales.
- Données fictives uniquement. Ne jamais présenter MarketFlow comme une interface de trading réel.

Supabase Auth est approprié si l’objectif est de livrer vite ; Keycloak est pertinent si l’auto-hébergement, les rôles et l’administration d’identité font partie de la démonstration. L’application métier ne doit dépendre que des claims JWT, pas du fournisseur choisi.

## Tests et livraison

### Pyramide de tests

| Niveau | Cible | Exemples |
| --- | --- | --- |
| Unitaires | Règles sans I/O | priorité prix-temps, matching partiel, annulation, calculs de réservation/P&L |
| Unitaires | Strategy Lab | calendrier DCA, frais, alignement au prochain jour de bourse, comparaison DCA/investissement unique |
| Propriété | Invariants du moteur | conservation des quantités, aucun croisement résiduel, déterminisme |
| Intégration | Services + vrais conteneurs | PostgreSQL/Kafka/Redis via Testcontainers, outbox, idempotence |
| Contract | API et événements | OpenAPI, JSON Schema, compatibilité des versions |
| E2E | Parcours utilisateur | connexion, ordre, trade, portefeuille et UI temps réel |
| Charge | Limites connues | rafale d’ordres, clients WS, lag et dégradation contrôlée |

Le moteur de matching mérite le plus haut niveau d’exigence : test unitaire et test de propriété à chaque changement. Mesurer la charge ne sert pas à promettre une performance de bourse ; cela sert à documenter la capacité de la démo et le comportement sous saturation.

### CI/CD et GitOps

1. **Pull request** : formatage, lint, type-check, tests unitaires, build, scans de dépendances et tests d’intégration ciblés.
2. **Main** : GitHub Actions construit les images `web`, `core-backend` et `matching-engine`, les tague avec le SHA du commit, puis les publie dans un registre.
3. **Configuration GitOps** : la CI met à jour les versions d’images dans les valeurs Helm de l’environnement `dev` ; ce commit est la demande de déploiement, pas un appel direct au cluster.
4. **Argo CD (SHOULD)** : surveille le dossier ou dépôt GitOps, compare l’état désiré à Kubernetes et synchronise `web`, `core-backend`, `matching-engine` et les dépendances d’infrastructure.
5. **Promotion** : après validation, une référence d’image immuable passe de `dev` à `demo`, jamais `latest`. Un revert Git restaure la configuration précédente.

```text
Commit applicatif
      ↓
GitHub Actions : tests → build Docker → registre d’images
      ↓
Commit GitOps : versions d’images dans Helm
      ↓
Argo CD : détecte le changement et synchronise Kubernetes
      ↓
Environnement dev ou démo : web + core-backend + matching-engine
```

Argo CD sert uniquement au déploiement et à la mise à jour. Il donne une vue de synchronisation, de santé et d’écart de configuration, utile pour l’administration technique et la soutenance. Commencer par une synchronisation **manuelle** pour l’environnement de démonstration ; activer l’auto-sync uniquement sur `dev` une fois le flux validé. Ne pas activer la suppression automatique des ressources au début.

Pour un développeur seul, commencer par Compose + CI. Kubernetes, Helm et Argo CD viennent ensuite ; ils ne doivent pas empêcher de livrer le flux métier.

## Organisation du dépôt

Un monorepo simplifie le partage de contrats et le démarrage solo.

```text
marketflow/
├── apps/
│   ├── web/                         # Next.js
│   ├── core-backend/                 # API, auth, portefeuille, admin, WS, consumers Kafka
│   └── matching-engine/              # carnet et matching ordonné
├── packages/
│   ├── domain/                      # types, règles et tests purs
│   ├── event-contracts/             # schémas + exemples versionnés
│   ├── api-client/                  # client généré OpenAPI
│   └── config/                      # lint, TypeScript, tests communs
├── jobs/                             # imports, DCA planifié, bots et replay ; pas des services permanents
│   ├── reference-data-import/
│   ├── strategy-scheduler/
│   ├── market-bots/
│   └── replay/
├── infra/
│   ├── compose/
│   ├── kafka/                       # création topics/config local
│   ├── helm/marketflow/
│   └── observability/
├── gitops/                           # valeurs par environnement (SHOULD)
├── docs/
│   ├── adr/                         # décisions d’architecture
│   ├── runbooks/                    # reprise, incident, replay
│   └── demos/
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── load/
├── .github/workflows/
├── docker-compose.yml
└── README.md
```

Créer un ADR court pour chaque décision coûteuse ou difficile à inverser : clé de partition Kafka, stratégie de reprise du carnet, modèle d’authentification, frontières de stockage, choix de format d’événement.

## Roadmap annuelle

Cette roadmap suppose un travail individuel régulier. Chaque phase se termine par une démo courte et un état stable ; une extension non terminée ne bloque pas la phase suivante.

| Période | Objectif | Livrables / preuve |
| --- | --- | --- |
| **Mois 1** | Cadrage et socle local | ADR initiaux, monorepo, Compose, CI minimale, modèle de domaine, catalogue local d’instruments et maquette UI. |
| **Mois 2** | Moteur déterministe | Carnet en mémoire, ordres limités, annulation, tests unitaires/propriété, CLI de scénario. |
| **Mois 3** | Flux transactionnel | PostgreSQL, API, outbox, Kafka, projecteur de portefeuille, idempotence testée. |
| **Mois 4** | MVP visible | Next.js, REST, WebSocket, carnet/transactions/portefeuille, démonstration d’un trade complet. |
| **Mois 5** | Strategy Lab MVP | Backtest DCA sur un actif, résultats graphiques, transactions simulées, comparaison investissement unique, tests de reproductibilité. |
| **Mois 6** | Portfolio Management V1 | Portefeuille multi-actifs, allocations, rebalancement, frais, comparaison de dates de départ, CAGR, volatilité, drawdown, Sharpe, benchmark et métriques glissantes. |
| **Mois 7** | Risk Engine | Corrélations, expositions, concentration, contraintes de risque, premiers rapports de risque, effet devise et projection Monte Carlo seedée. **Gel fonctionnel du moteur de simulation avant optimisation.** |
| **Mois 8** | Optimisation | Explorateur d'allocations (balayage de poids, frontière efficiente, objectifs Sharpe/min variance/risk parity), optimisation sous contraintes, validation hors échantillon face au mix équipondéré, profils de clients fictifs. |
| **Mois 9** | Paper trading et reporting | Portefeuilles virtuels, suivi à partir d’aujourd’hui, objectifs financiers et taux de retrait, reporting gestionnaire et historique des décisions. |
| **Mois 10** | Simulation et historique | Bots seedés, plusieurs instruments, importeur optionnel de données de référence, OHLCV, ClickHouse et replay simple. |
| **Mois 11** | Plateforme de déploiement | Images, Kubernetes, Helm, Argo CD, OpenTelemetry et environnements `dev`/`demo`. |
| **Mois 12** | Soutenance | Résilience, tests finaux, documentation, dataset reproductible, script de démo et rapport. |
| **Mois 7** | Simulation et historique | Bots seedés, plusieurs instruments, importeur optionnel de données de référence, OHLCV, ClickHouse et replay simple. |
| **Mois 8** | Plateforme de déploiement | Images, Kubernetes, Helm, environnements `dev`/`demo`. |
| **Mois 9** | GitOps et traçabilité | Argo CD, OpenTelemetry, dashboard/trace d’un ordre, runbooks. |
| **Mois 10** | Résilience | Reprise projecteur/moteur, sauvegarde-restauration, scénarios de panne contrôlés. |
| **Mois 11** | Stabilisation | Charge mesurée, correction de dette ciblée, tests de non-régression, audit sécurité de base. |
| **Mois 12** | Soutenance | Script de démo, dataset reproductible, schémas, métriques avant/après panne, rapport. |

### Ordre strict de priorité

Si le temps manque : finir le MVP du mois 6, documenter ses limites et préparer une excellente démo. ClickHouse, Kubernetes, Argo CD et chaos engineering sont des extensions, pas des prérequis au succès du projet.

## Définition de terminé

### MVP terminé lorsque

- [ ] Un nouvel environnement démarre avec une commande documentée et un jeu de données de démo.
- [ ] Un utilisateur authentifié ou un compte de démonstration peut soumettre et annuler un ordre limite.
- [ ] Deux ordres compatibles produisent une exécution, une mise à jour de portefeuille et une mise à jour UI.
- [ ] Un backtest DCA mensuel sur un actif historique est reproductible, liste ses transactions et affiche sa courbe de valeur.
- [ ] Le résultat compare explicitement le DCA à un investissement unique et indique les frais, période et règle d’exécution.
- [ ] Une répétition de requête avec la même `Idempotency-Key` ne crée pas de double ordre.
- [ ] Les règles de matching et invariants critiques sont couverts par des tests automatisés.
- [ ] Kafka, PostgreSQL et Redis sont observables ; un dashboard montre au moins ordre, lag et erreurs.
- [ ] La recherche d’instruments, la fiche et le graphique lisent les données persistées par MarketFlow, sans appel navigateur vers un fournisseur externe.
- [ ] Le README contient l’installation, les limites et le scénario de démo.

### Extension terminée lorsque

- [ ] Le besoin auquel elle répond est explicite et mesurable.
- [ ] Elle est déployable/reproductible et possède une stratégie de rollback ou de désactivation.
- [ ] Elle est instrumentée et testée au niveau approprié.
- [ ] Elle ne dégrade pas le parcours MVP.

## Démo et soutenance

### Démonstration principale (5 à 7 minutes)

1. Ouvrir deux comptes virtuels et le tableau de marché.
2. Montrer le carnet vide, puis placer un ordre vendeur depuis le premier compte.
3. Placer un ordre acheteur compatible depuis le second ; montrer l’exécution partielle et la priorité prix-temps.
4. Suivre le même `correlationId` dans la trace, les logs et les métriques.
5. Montrer la mise à jour cohérente : derniers trades, carnet, cash, position et ledger.
6. Arrêter un projecteur, générer quelques événements, puis le redémarrer pour prouver qu’il rattrape son retard sans doubler les écritures.

### Questions auxquelles le projet doit répondre clairement

- Pourquoi Kafka plutôt qu’un appel HTTP direct entre tous les services ?
- Comment l’ordre est-il garanti pour un instrument sans prétendre à un ordre global ?
- Pourquoi PostgreSQL, Redis et ClickHouse coexistent-ils ?
- Comment évitez-vous les doubles exécutions et les doubles mises à jour de portefeuille ?
- Quelle est la frontière entre ce simulateur et une vraie plateforme de trading réglementée ?

Préparer une fiche d’architecture d’une page, un diagramme de séquence d’ordre, un dashboard propre et une vidéo de secours de la démo. Une démonstration reproductible vaut mieux qu’un grand nombre de technologies simplement installées.

## Risques et décisions à éviter

| Risque / anti-pattern | Décision saine |
| --- | --- |
| Commencer par Kubernetes, Argo et dix services | Commencer par le domaine, Compose et un MVP intégrable. |
| Répartir un carnet d’un même instrument | Une partition/instance logique par instrument. |
| Utiliser `float` pour prix, cash ou quantité | Entiers en ticks/lots et règles d’arrondi explicites. |
| Croire que Kafka donne « exactly once » partout | At-least-once + consommateurs idempotents + outbox. |
| Écrire dans la base d’un autre service | Projections via événements ou API contractuelle. |
| Utiliser Redis ou Yahoo Finance comme source de vérité | PostgreSQL/ledger pour la vérité ; Redis reconstructible ; fournisseur externe limité aux données de référence. |
| Ajouter ClickHouse avant d’avoir une vraie requête analytique | PostgreSQL au MVP, ClickHouse pour historique/agrégats. |
| Mélanger commandes et événements sans convention | Topics, clés, version et schémas documentés dès le début. |
| Viser la performance HFT | Mesurer une capacité de démonstration et documenter les limites. |
| Mettre secrets, clés ou données personnelles dans Git | Secrets externes, comptes fictifs, rotation et moindre privilège. |

## Démarrage recommandé

1. Écrire les trois premiers ADR : **partitionnement par instrument**, **valeurs monétaires en ticks**, **outbox + idempotence**.
2. Implémenter et tester le carnet en mémoire, sans Kafka ni interface.
3. Ajouter PostgreSQL et l’API de soumission ; seulement ensuite Kafka et les projecteurs.
4. Brancher l’interface et WebSocket une fois les événements stables.
5. Geler le MVP, puis choisir une extension à la fois selon la roadmap.

---

MarketFlow est un simulateur pédagogique. Les comptes, portefeuilles, ordres, prix d’exécution et événements sont fictifs et persistent dans MarketFlow. Le catalogue ou les historiques de référence peuvent, si souhaité, provenir d’une source externe ; ils ne transforment pas le simulateur en plateforme de trading réel.
