# 22 · Kubernetes, Helm et Argo CD — User stories

> Sources : README racine : Kubernetes, Helm, Argo CD (SHOULD), Déploiement (roadmap mois 11).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `docker-compose.yml` | Kafka, PostgreSQL, Conduktor pour le local. | Équivalents Kubernetes ; Compose reste l'outil de dev. |
| `deploy/` | Absent. | Charts, scripts, Argo CD. |
| `apps/*/Dockerfile` | Créés en 21. | Référencés par les charts. |

## Hors périmètre

- Cluster cloud (EKS, GKE, AKS).
- Multi-région.
- Service mesh.
- Keycloak (COULD).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Cluster | kind en local ; aucun cloud | Pas de coût ni de compte cloud ; suffisant pour la démo et la soutenance. |
| D2 | Kafka sur le cluster | Opérateur Strimzi | Standard pour Kafka sur Kubernetes ; évite un StatefulSet écrit à la main. |
| D3 | PostgreSQL | Opérateur CloudNativePG | Sauvegarde et restauration natives, reprises en 24. |
| D4 | Packaging | Un chart par service, valeurs par environnement | Un chart unique pour tout serait plus difficile à lire pour un débutant. |
| D5 | GitOps | Argo CD en app-of-apps | Une application racine qui déclare les autres ; un seul point d'entrée. |

---

## User stories

### Lot 1 — Cluster

#### US-01 · Démarrer toute la stack sur un cluster — MUST

**En tant que** développeur, **je veux** déployer les services, Kafka et PostgreSQL sur un cluster par commande **afin de** vérifier que l'architecture tourne hors de mon poste..

Critères d’acceptation :
- [ ] La stack complète démarre sur kind.
- [ ] Les probes indiquent l'état de chaque service.

Tâches : T-01, T-02, T-03, T-04, T-05, T-06, T-08, T-09 (détail dans `TASKS.md`).

---

### Lot 2 — Chart

### Lot 3 — Données

### Lot 4 — GitOps

#### US-02 · Déployer depuis Git — MUST

**En tant que** développeur, **je veux** qu'un changement dans `deploy/` se déploie après fusion **afin de** éviter les déploiements manuels non traçables..

Critères d’acceptation :
- [ ] Argo CD synchronise le cluster avec le dépôt.

Tâches : T-07 (détail dans `TASKS.md`).

---

#### US-03 · Séparer dev et demo — MUST

**En tant que** développeur, **je veux** deux environnements avec des valeurs distinctes **afin de** présenter une version stable sans casser la version de travail..

Critères d’acceptation :
- [ ] Les deux environnements se déploient avec les mêmes charts et des valeurs différentes.

Tâches : T-07 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Démarrer toute la stack sur un cluster | MUST | 1 | infra, docs |
| US-02 | Déployer depuis Git | MUST | 4 | infra |
| US-03 | Séparer dev et demo | MUST | 4 | infra |
