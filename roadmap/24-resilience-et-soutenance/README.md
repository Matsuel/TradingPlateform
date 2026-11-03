# 24 · Résilience et soutenance

- **Statut** : Planifiée
- **Roadmap** : Mois 12 — Mois 12 — Résilience et soutenance (reprise des consumers, sauvegarde-restauration, pannes contrôlées, charge, audit, démo)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/resilience-et-soutenance` — PR à ouvrir
- **Points** : 27 (MUST 24, SHOULD 3) — prévus
- **Maquettes** : aucune
- **Dépend de** : 23 (observabilité pour mesurer les pannes) ; 22 (cluster pour les pannes et la sauvegarde).

## Objectif

Le projet prouve qu'il tient sous panne et qu'une démo se rejoue à l'identique. C'est la dernière étape : elle transforme la stack en preuve pour la soutenance.

## Comment

Tests de reprise automatisés, pannes contrôlées sur le cluster, sauvegarde PostgreSQL, charge scriptée (k6), audit de base, jeu de données fixe et script de démo.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Charge** : k6, script versionné | Outil standard, scripts en JavaScript ; nouvelle dépendance d'outil seulement, pas de code applicatif. | `US.md` (à valider) |
| D2 | **Sauvegarde** : CronJob `pg_dump` ou sauvegarde CloudNativePG, restauration testée | Une sauvegarde non restaurée ne prouve rien ; le test de restauration est le critère. | `US.md` (à valider) |
| D3 | **Pannes** : Arrêt de Kafka et de PostgreSQL, arrêt du worker | Couvre les trois composants avec état ; pas de chaos aléatoire (COULD). | `US.md` (à valider) |
| D4 | **Audit** : `bun audit` et scan de secrets, pas d'audit externe | Périmètre de l'utilisateur ; un audit externe est hors périmètre. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
