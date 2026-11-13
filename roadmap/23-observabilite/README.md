# 23 · Observabilité : OpenTelemetry, traces, runbooks

- **Statut** : Planifiée
- **Roadmap** : Mois 11 — Mois 11 — Plateforme de déploiement (OpenTelemetry, trace d'une simulation de bout en bout, runbooks). Le tableau Grafana de base est un critère MVP du README, non encore coché.
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/observabilite` — PR à ouvrir
- **Points** : 29 (MUST 27, SHOULD 2) — prévus
- **Maquettes** : aucune (tableau de bord Grafana, pas de maquette Figma)
- **Écrans modifiés** : aucun (Grafana, pas d’écran web)
- **Dépend de** : 22 (cluster où déployer le collecteur) ; 21 pour les images.

## Objectif

Une simulation se suit de la requête à son résultat, et l'état de la plateforme se lit sur un tableau de bord. C'est la preuve d'observabilité exigée par l'objectif pédagogique 6.

## Comment

OpenTelemetry dans les services Node, contexte propagé dans les headers Kafka. Métriques Prometheus, Grafana avec un tableau versionné. Un collecteur OTLP commun.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Traces** : OpenTelemetry (SDK Node), export OTLP | Standard ouvert ; un seul format pour les quatre services. | `US.md` (à valider) |
| D2 | **Métriques** : Prometheus, pas d'outil propriétaire | Standard du déploiement Kubernetes (22). | `US.md` (à valider) |
| D3 | **Corrélation** : `traceId` dans les logs et les traces, `executionId` en attribut | Relie une simulation à ses logs sans changer le format des événements Kafka. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
