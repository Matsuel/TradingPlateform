# 21 · Pipeline CI/CD et images

- **Statut** : Planifiée
- **Roadmap** : Mois 11 — Mois 11 — Plateforme de déploiement (images, CI/CD)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/cicd-et-images` — PR à ouvrir
- **Points** : 26 (MUST 22, SHOULD 4) — prévus
- **Maquettes** : aucune (infrastructure)
- **Dépend de** : aucune dépendance fonctionnelle : peut être avancée (voir note de `roadmap/README.md`).

## Objectif

Chaque modification est vérifiée automatiquement et chaque commit produit des images déployables. C'est la base de la chaîne de livraison demandée par l'objectif pédagogique 5 du README.

## Comment

GitHub Actions : un workflow de vérification par PR, un workflow de publication d'images par commit sur `main`. Un Dockerfile multi-stage par application. Aucun déploiement dans cette feature (voir 22).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Plateforme CI** : GitHub Actions | Le dépôt est sur GitHub ; pas d'outil supplémentaire. | `US.md` (à valider) |
| D2 | **Registre** : GitHub Container Registry, tag = SHA | Gratuit avec le dépôt ; le SHA garantit qu'une image correspond à un commit. | `US.md` (à valider) |
| D3 | **Déploiement** : Hors de cette feature | Le déploiement dépend du cluster (22) ; une image publiée ne déploie rien seule. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
