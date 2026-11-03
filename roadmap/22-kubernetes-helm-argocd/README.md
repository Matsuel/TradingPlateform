# 22 · Kubernetes, Helm et Argo CD

- **Statut** : Planifiée
- **Roadmap** : Mois 11 — Mois 11 — Plateforme de déploiement (Kubernetes, Helm, Argo CD, environnements dev et demo)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/kubernetes-helm-argocd` — PR à ouvrir
- **Points** : 34 (MUST 29, SHOULD 5) — prévus
- **Maquettes** : aucune (infrastructure)
- **Dépend de** : 21 (images publiées).

## Objectif

La stack complète tourne sur un cluster, déployée depuis Git. C'est la preuve de reproductibilité de déploiement demandée par le README, avec des environnements `dev` et `demo`.

## Comment

Un chart Helm par service, Kafka (Strimzi) et PostgreSQL (CloudNativePG) par opérateurs, Argo CD en app-of-apps. Cluster local kind. Les valeurs par environnement sont dans le dépôt.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Cluster** : kind en local ; aucun cloud | Pas de coût ni de compte cloud ; suffisant pour la démo et la soutenance. | `US.md` (à valider) |
| D2 | **Kafka sur le cluster** : Opérateur Strimzi | Standard pour Kafka sur Kubernetes ; évite un StatefulSet écrit à la main. | `US.md` (à valider) |
| D3 | **PostgreSQL** : Opérateur CloudNativePG | Sauvegarde et restauration natives, reprises en 24. | `US.md` (à valider) |
| D4 | **Packaging** : Un chart par service, valeurs par environnement | Un chart unique pour tout serait plus difficile à lire pour un débutant. | `US.md` (à valider) |
| D5 | **GitOps** : Argo CD en app-of-apps | Une application racine qui déclare les autres ; un seul point d'entrée. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
