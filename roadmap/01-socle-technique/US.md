# 01 · Socle technique — User stories

> Sources : README, « Roadmap annuelle », mois 1 ; commits du 2026-09-30 au 2026-10-19 (rétro).

## Hors périmètre

- CI minimale et ADR initiaux (prévus au mois 1, non réalisés).
- Authentification : feature 02.

---

## User stories

### Lot 1 — Cadrage et infrastructure

#### US-01 · Cadrer le projet — MUST

**En tant qu’** évaluateur, **je veux** un README qui décrit la vision, le périmètre et la roadmap **afin de** juger le projet et son ambition.

Critères d’acceptation :
- [x] Vision, priorités MUST/SHOULD/COULD, architecture cible et roadmap annuelle décrites.
- [x] Section « Portfolio Management Lab » (portefeuille, risque, optimisation).

Tâches : T-01.

#### US-02 · Démarrer l’infrastructure locale en une commande — MUST

**En tant que** développeur, **je veux** lancer Kafka et PostgreSQL avec `docker compose up` **afin de** travailler sans installation manuelle.

Critères d’acceptation :
- [x] Kafka, PostgreSQL de l’application et Conduktor démarrent depuis `docker-compose.yml`.

Tâches : T-02.

### Lot 2 — API et base

#### US-03 · Disposer d’une API aux erreurs uniformes — MUST

**En tant que** client de l’API (le web), **je veux** des réponses d’erreur au même format avec le bon statut HTTP **afin de** les afficher sans cas particulier.

Critères d’acceptation :
- [x] Express 5 et CORS configurés.
- [x] Une erreur lancée (`BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`, `Internal`) est formatée par `error.middleware`.
- [x] Routes déclarées par descripteurs et enregistrées par le builder.

Tâches : T-05, T-06.

#### US-04 · Persister les données dans PostgreSQL — MUST

**En tant que** développeur, **je veux** un accès typé à PostgreSQL avec migrations **afin de** faire évoluer le schéma sans risque.

Critères d’acceptation :
- [x] Prisma configuré avec l’adaptateur PostgreSQL, migration initiale.
- [x] Connexion vérifiée au démarrage de l’API.

Tâches : T-04, T-07.

#### US-05 · Gérer des portefeuilles — SHOULD

**En tant qu’** utilisateur, **je veux** créer, lire, modifier et supprimer mes portefeuilles **afin de** préparer la bourse simulée.

Critères d’acceptation :
- [x] Routes CRUD `portfolio` en couches routes → controller → service → repository.

Tâches : T-08.

### Lot 3 — Applications

#### US-06 · Initialiser l’application web et le monorepo — MUST

**En tant que** développeur, **je veux** une application Next.js et un workspace Bun **afin de** développer front et back dans le même dépôt.

Critères d’acceptation :
- [x] Application Next.js (App Router, Tailwind) dans `apps/web`.
- [x] `package.json` racine Bun.

Tâches : T-03, T-09.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Cadrer le projet | MUST | 1 | README |
| US-02 | Infrastructure locale | MUST | 1 | docker-compose |
| US-03 | API aux erreurs uniformes | MUST | 2 | core-backend |
| US-04 | Persistance PostgreSQL | MUST | 2 | core-backend |
| US-05 | Portefeuilles | SHOULD | 2 | core-backend |
| US-06 | Application web et monorepo | MUST | 3 | web, racine |
