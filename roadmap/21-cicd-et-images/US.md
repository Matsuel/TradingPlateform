# 21 · Pipeline CI/CD et images — User stories

> Sources : README racine : Déploiement (CI/CD, Compose local) ; roadmap mois 11.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `.github/` | Absent. | Workflows CI et images. |
| `apps/*/Dockerfile` | Absent sur les quatre applications. | Un Dockerfile par application. |
| `package.json (racine)` | Scripts `dev`, `dev:backend`, `dev:market`, `dev:web`, `dev:backtest`. | Pas de script de vérification. |
| `apps/web/next.config.ts` | Présent ; `output` non défini (à vérifier au démarrage). | `output: 'standalone'`. |
| `docker-compose.yml` | Kafka, PostgreSQL (x2), Conduktor : développement local. | Rien : Compose reste l'outil local. |

## Hors périmètre

- Déploiement sur un cluster (22).
- Environnement éphémère par PR (COULD du README).
- Analyse de vulnérabilités des images (audit en 24).
- Publication d'un paquet npm.

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Plateforme CI | GitHub Actions | Le dépôt est sur GitHub ; pas d'outil supplémentaire. |
| D2 | Registre | GitHub Container Registry, tag = SHA | Gratuit avec le dépôt ; le SHA garantit qu'une image correspond à un commit. |
| D3 | Déploiement | Hors de cette feature | Le déploiement dépend du cluster (22) ; une image publiée ne déploie rien seule. |

---

## User stories

### Lot 1 — CI

#### US-01 · Savoir qu'une modification ne casse rien — MUST

**En tant que** développeur, **je veux** que chaque PR lance types, tests et format automatiquement **afin de** ne pas découvrir une erreur après la fusion..

Critères d’acceptation :
- [ ] Une PR cassée est signalée avant fusion.
- [ ] Le résultat est visible dans la PR.

Tâches : T-01, T-07 (détail dans `TASKS.md`).

---

#### US-03 · Protéger la branche principale — SHOULD

**En tant que** développeur, **je veux** que la fusion soit bloquée tant que les checks échouent **afin de** éviter de fusionner du code non vérifié..

Critères d’acceptation :
- [ ] Les checks requis sont documentés.

Tâches : T-08 (détail dans `TASKS.md`).

---

### Lot 2 — Images

#### US-02 · Construire les images de façon reproductible — MUST

**En tant que** développeur, **je veux** des images Docker construites à chaque commit, taggées par SHA **afin de** déployer exactement le code testé..

Critères d’acceptation :
- [ ] Quatre images publiées par commit sur `main`.
- [ ] Aucun secret dans une image.

Tâches : T-02, T-03, T-04, T-05, T-06 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Savoir qu'une modification ne casse rien | MUST | 1 | infra |
| US-02 | Construire les images de façon reproductible | MUST | 2 | infra |
| US-03 | Protéger la branche principale | SHOULD | 1 | docs |
