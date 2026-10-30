# 02 · Authentification et layout — User stories

> Sources : README, « Roadmap annuelle », mois 1 (auth, maquette UI) ; maquettes `01`, `02`, `16` ; commits du 2026-10-06 au 2026-10-28 (rétro).

## Hors périmètre

- Rôles et pages d’administration : feature 04.
- Contenu des pages Paramètres (maquettes `10.x`).

---

## User stories

### Lot 1 — Authentification

#### US-01 · Créer un compte et se connecter — MUST

**En tant que** visiteur, **je veux** m’inscrire puis me connecter par e-mail et mot de passe **afin d’**accéder à mon espace.

Critères d’acceptation :
- [x] Inscription et connexion via better-auth (e-mail et mot de passe).
- [x] Formulaires validés (zod, react-hook-form), erreurs affichées sous les champs.
- [x] Après inscription ou connexion, redirection vers `/app`.

Tâches : T-01, T-02, T-04, T-05, T-08.

#### US-02 · Protéger l’API et les pages — MUST

**En tant qu’** utilisateur, **je veux** que mes données et pages ne soient accessibles qu’avec ma session **afin qu’**aucun autre compte ne les voie.

Critères d’acceptation :
- [x] `auth.middleware` rejette en 401 une requête sans session et pose `req.userId` sinon.
- [x] Une page de l’application sans session redirige vers `/login?redirect=<page>`.
- [x] Une page d’auth avec session redirige vers `/app`.

Tâches : T-03, T-04, T-07.

### Lot 2 — Navigation

#### US-03 · Naviguer dans l’application — MUST

**En tant qu’** utilisateur connecté, **je veux** une sidebar, un en-tête avec fil d’Ariane et mon profil **afin de** passer d’un écran à l’autre.

Critères d’acceptation :
- [x] Sidebar par onglets décrite dans `constants/sidebar.tsx`, menu utilisateur (déconnexion).
- [x] `Header` avec fil d’Ariane, `PageLayout` / `PageHeader` communs.
- [x] Session lue côté serveur dans le layout `/app`.

Tâches : T-06, T-07.

#### US-04 · Pages système — SHOULD

**En tant qu’** utilisateur, **je veux** une page 404 utile et une page d’accueil **afin de** ne jamais rester bloqué.

Critères d’acceptation :
- [x] Page 404 avec boutons de retour (maquette `16`).
- [x] Page Paramètres (squelette) et page d’accueil vitrine.

Tâches : T-09.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Créer un compte et se connecter | MUST | 1 | core-backend, web |
| US-02 | Protéger l’API et les pages | MUST | 1 | core-backend, web |
| US-03 | Naviguer dans l’application | MUST | 2 | web |
| US-04 | Pages système | SHOULD | 2 | web |
