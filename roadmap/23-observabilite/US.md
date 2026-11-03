# 23 · Observabilité : OpenTelemetry, traces, runbooks — User stories

> Sources : README racine : Observabilité (logs, métriques, dashboard minimal ; traces distribuées, alertes) ; objectif pédagogique 6.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `packages/utils/src/logger.ts` | `Logger.here()` : logs texte. | Champs `traceId` et `executionId`, format JSON. |
| `packages/kafka/src/` | `KafkaProducer`, `KafkaConsumer`, `createKafkaEvent`. | Headers de trace. |
| `apps/core-backend/lib/` | `kafka.ts`, `auth.ts`. | Initialisation de la télémétrie. |
| `docker-compose.yml` | Kafka et Conduktor (interface Kafka). | Collecteur, Prometheus, Grafana. |

## Hors périmètre

- Alertes envoyées par e-mail ou messagerie.
- Traces du web (navigateur).
- ClickHouse ou stockage long terme des métriques.
- Chaos testing (24).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Traces | OpenTelemetry (SDK Node), export OTLP | Standard ouvert ; un seul format pour les quatre services. |
| D2 | Métriques | Prometheus, pas d'outil propriétaire | Standard du déploiement Kubernetes (22). |
| D3 | Corrélation | `traceId` dans les logs et les traces, `executionId` en attribut | Relie une simulation à ses logs sans changer le format des événements Kafka. |

---

## User stories

### Lot 1 — Logs

#### US-01 · Suivre une simulation de bout en bout — MUST

**En tant que** mainteneur, **je veux** suivre une simulation de la requête HTTP jusqu'au résultat, avec le même identifiant **afin de** démontrer le parcours asynchrone à la soutenance..

Critères d’acceptation :
- [ ] Une trace relie requête, message Kafka et traitement du worker.
- [ ] Les logs portent le même identifiant.

Tâches : T-01, T-02, T-03, T-04 (détail dans `TASKS.md`).

---

### Lot 2 — Traces

### Lot 3 — Métriques

#### US-02 · Voir l'état de la plateforme — MUST

**En tant que** mainteneur, **je veux** un tableau de bord avec simulations, lag et erreurs **afin de** détecter une panne avant qu'elle ne se voie..

Critères d’acceptation :
- [ ] Le tableau affiche simulations par statut, lag et erreurs.
- [ ] Les métriques arrivent dans Grafana en local et sur le cluster.

Tâches : T-05, T-06, T-07 (détail dans `TASKS.md`).

---

#### US-03 · Savoir quoi faire quand une alerte sonne — SHOULD

**En tant que** mainteneur, **je veux** un runbook par alerte **afin de** réagir sans chercher..

Critères d’acceptation :
- [ ] Chaque alerte définie a son runbook.

Tâches : T-08 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Suivre une simulation de bout en bout | MUST | 1 | packages/utils, core-backend, packages/kafka, backtest-engine |
| US-02 | Voir l'état de la plateforme | MUST | 3 | core-backend, infra |
| US-03 | Savoir quoi faire quand une alerte sonne | SHOULD | 3 | docs |
