# 24 · Résilience et soutenance — User stories

> Sources : README racine : Fiabilité (résilience, observabilité, sécurité), Démo et soutenance, roadmap mois 12.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/consumers/` | Consumer `backtest.requested` avec garde de statut (rejeu idempotent, MVP). | Tests de reprise sous charge. |
| `apps/core-backend/prisma/` | Schéma et migrations ; seed à vérifier. | Seed fixe. |
| `audit/` | Dossier existant. | Résultats d'audit de base. |
| `docs/` | À vérifier au démarrage. | Démo et architecture. |

## Hors périmètre

- Chaos testing aléatoire programmé (COULD).
- Multi-région.
- Audit de sécurité externe.
- Haute disponibilité avec plusieurs réplicas de Kafka.

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Charge | k6, script versionné | Outil standard, scripts en JavaScript ; nouvelle dépendance d'outil seulement, pas de code applicatif. |
| D2 | Sauvegarde | CronJob `pg_dump` ou sauvegarde CloudNativePG, restauration testée | Une sauvegarde non restaurée ne prouve rien ; le test de restauration est le critère. |
| D3 | Pannes | Arrêt de Kafka et de PostgreSQL, arrêt du worker | Couvre les trois composants avec état ; pas de chaos aléatoire (COULD). |
| D4 | Audit | `bun audit` et scan de secrets, pas d'audit externe | Périmètre de l'utilisateur ; un audit externe est hors périmètre. |

---

## User stories

### Lot 1 — Résilience

#### US-01 · Garder un résultat fiable quand un service tombe — MUST

**En tant que** mainteneur, **je veux** des pannes contrôlées avec un comportement mesuré **afin de** démontrer la reprise sans perte ni doublon..

Critères d’acceptation :
- [ ] Un worker arrêté puis redémarré rattrape son retard sans doubler de résultat.
- [ ] Les pannes Kafka et PostgreSQL sont documentées avec un délai de reprise.

Tâches : T-01, T-02, T-04 (détail dans `TASKS.md`).

---

### Lot 2 — Données

#### US-02 · Restaurer les données — MUST

**En tant que** mainteneur, **je veux** restaurer la base à partir d'une sauvegarde **afin de** prouver que les données ne sont pas perdues..

Critères d’acceptation :
- [ ] Une restauration testée reproduit les données.

Tâches : T-03 (détail dans `TASKS.md`).

---

### Lot 3 — Charge

### Lot 4 — Sécurité

#### US-04 · Connaître les failles de base — SHOULD

**En tant que** mainteneur, **je veux** un audit de sécurité de base **afin de** montrer que les risques ont été regardés..

Critères d’acceptation :
- [ ] Le résultat de l'audit est écrit, avec les points restants.

Tâches : T-05 (détail dans `TASKS.md`).

---

### Lot 5 — Démo

#### US-03 · Rejouer la démo à l'identique — MUST

**En tant que** mainteneur, **je veux** un jeu de données et un script de démo fixes **afin de** présenter le projet sans surprise..

Critères d’acceptation :
- [ ] Le seed crée le même jeu ; le script suit le parcours du README.

Tâches : T-06, T-07 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Garder un résultat fiable quand un service tombe | MUST | 1 | backtest-engine, infra |
| US-02 | Restaurer les données | MUST | 2 | infra |
| US-03 | Rejouer la démo à l'identique | MUST | 5 | core-backend, docs |
| US-04 | Connaître les failles de base | SHOULD | 4 | docs |
