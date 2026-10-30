# 04 · Rôles et administration — User stories

> Sources : maquettes `14`, `18` ; PR #2 (rétro).

## Hors périmètre

- Contenu des pages Monitoring (tableau de bord d’exploitation) et Utilisateurs (liste, actions).

---

## User stories

### Lot 1 — Rôles

#### US-01 · Attribuer un rôle aux comptes — SHOULD

**En tant qu’** administrateur, **je veux** que chaque compte ait un rôle **afin de** réserver certaines actions à l’administration.

Critères d’acceptation :
- [x] Rôle stocké sur l’utilisateur (plugin `admin` de better-auth), impersonation disponible.

Tâches : T-01.

#### US-02 · Réserver les pages d’administration — SHOULD

**En tant qu’** administrateur, **je veux** des pages Monitoring et Utilisateurs invisibles des autres comptes **afin que** seuls les administrateurs y accèdent.

Critères d’acceptation :
- [x] Layout `(admin)` qui redirige vers `/app` un compte sans rôle admin.
- [x] Entrées de sidebar affichées selon le rôle.

Tâches : T-02.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Attribuer un rôle | SHOULD | 1 | core-backend, web |
| US-02 | Réserver les pages d’administration | SHOULD | 1 | web |
