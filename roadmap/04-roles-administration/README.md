# 04 · Rôles et administration

- **Statut** : Livrée
- **Roadmap** : Mois 1 — socle (exploitation)
- **Période** : 2026-10-26
- **Branche / PR** : `feat/user-roles` — #2 (merge `c381e68`)
- **Points** : 6 (MUST 0, SHOULD 6) — estimés a posteriori
- **Maquettes** : `14 · Monitoring / Admin`, `18 · Administration / Utilisateurs` (squelettes seulement)

## Objectif

Distinguer administrateurs et utilisateurs : rôle porté par le compte, pages d’administration réservées, entrées de sidebar filtrées. Prépare le monitoring et la gestion des utilisateurs.

## Comment

- **Backend** : plugin `admin` de better-auth (rôle, bannissement, impersonation), colonnes ajoutées par migration (`a7877c9`).
- **Web** : groupe de routes `app/(admin)` dont le layout vérifie le rôle côté serveur (`lib/session.ts`) (`requireSession`, puis `isAdmin` sinon redirection vers `/app`) ; pages Monitoring et Utilisateurs ; chaque groupe de `constants/sidebar.tsx` porte un drapeau `adminOnly` (`1145313`).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | Rôles via le plugin `admin` de better-auth. | Pas de modèle de permissions maison. | `a7877c9` |
| D2 | Garde du rôle dans le layout serveur du groupe `(admin)`. | Une seule vérification pour toutes les pages admin. | `1145313` |

## Écarts au plan

La PR #2 contient aussi les premiers commits du backtest (modèles et API), poussés sur la même branche ; ils sont documentés dans la feature 05.

## Bilan

Rôles et garde livrés. Limites : pages Monitoring et Utilisateurs vides (maquettes 14 et 18 non implémentées).

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
