# 02 · Authentification et layout

- **Statut** : Livrée
- **Roadmap** : Mois 1 — auth et maquette UI
- **Période** : 2026-10-06 → 2026-10-28
- **Branche / PR** : commits directs sur `develop`
- **Points** : 28 (MUST 26, SHOULD 2) — estimés a posteriori
- **Maquettes** : `01 · Connexion`, `02 · Inscription`, `16 · Page 404`, `10 · Paramètres / Profil` (en-tête seulement)

## Objectif

Permettre à un utilisateur de créer un compte, de se connecter et de naviguer dans une application protégée : API qui identifie l’utilisateur, pages réservées aux sessions valides, sidebar et en-tête communs.

## Comment

- **Backend** : better-auth branché sur Prisma (`lib/auth.ts`), e-mail et mot de passe, plugins `jwt` et `bearer` ; tables d’auth migrées (`1ec0cb2`, `b8c6606`). `auth.middleware` vérifie la session et pose `req.userId` (augmentation de `Express.Request`, `63fb198`).
- **Protection web** : `apps/web/proxy.ts` (le middleware de Next 16) redirige vers `/login?redirect=…` sans cookie de session, et vers `/app` depuis les pages d’auth (`ec7de4e`, `31599bf`). Le layout `/app` lit la session côté serveur (`lib/session.ts`, `5925b0b`).
- **Formulaires** : react-hook-form et un composant `Form` réutilisable (`1cf3467`, `65c4159`), puis réécriture en `features/auth/` (schéma zod, `api.ts`, `hook.ts`, `login-form.tsx`, `register-form.tsx`) adossée aux champs partagés de la feature 05 (`09454d3`, `1de4101`).
- **Navigation** : composants shadcn (sidebar, dropdown, sheet, tooltip…), navigation par onglets décrite dans `constants/sidebar.tsx`, `Header` avec fil d’Ariane, groupes de routes `(auth)` / `(base)` / `app` (`3322557` → `e8c57e8`).
- **Pages système** : 404, paramètres (squelette) et page d’accueil vitrine (`1c3544b`, `336b764`).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | better-auth plutôt qu’une auth maison ; Keycloak reste un COULD. | Sessions, JWT et plugins (admin, feature 04) prêts à l’emploi. | `1ec0cb2` |
| D2 | Protection des pages dans `proxy.ts` (cookie) + lecture de session côté serveur dans le layout. | Redirection avant rendu ; données de session disponibles en Server Component. | `31599bf`, `5925b0b` |
| D3 | Formulaires par feature (`features/auth/`) sur des champs partagés. | Même forme pour tous les formulaires du web. | `1de4101` |

## Écarts au plan

Le premier écran connecté s’appelait `/dashboard` ; il est devenu `/app` (`dbe29f3`), d’où le correctif de redirection après inscription (`0d8a954`).

## Bilan

Auth et navigation livrées et réutilisées par toutes les features. Limites : page Paramètres vide (maquettes 10.x non implémentées) ; l’ancien composant de formulaire (`OldForm.tsx`) a été retiré lors de la réécriture.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
