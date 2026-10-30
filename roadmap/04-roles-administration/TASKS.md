# 04 · Rôles et administration — Tâches

> Échelle de points, statuts et définition de terminé commune : [`roadmap/README.md`](../README.md). Points estimés a posteriori.

## Synthèse

| Tâche | Titre | US | Couche | Priorité | Points | Dépend de | Commits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | Rôles et impersonation better-auth | US-01 | core-backend, web | SHOULD | 3 | — | `a7877c9` |
| T-02 | Layout admin, pages et sidebar par rôle | US-02 | web | SHOULD | 3 | T-01 | `1145313` |

**Total** : 6 points — MUST 0, SHOULD 6.

---

## Lot 1 — Rôles

### T-01 · Rôles et impersonation better-auth

- **US** : US-01 · **Priorité** : SHOULD · **Points** : 3 · **Dépend de** : — · **Commits** : `a7877c9`
- **Fichiers** : `apps/core-backend/lib/auth.ts`, `prisma/schema.prisma`, migration `add_role_support`, `apps/web/src/lib/auth.ts`, `constants/sidebar.tsx`

Critères d’acceptation :
- [x] Plugin `admin` côté serveur et client ; colonnes de rôle et d’impersonation migrées.

### T-02 · Layout admin, pages et sidebar par rôle

- **US** : US-02 · **Priorité** : SHOULD · **Points** : 3 · **Dépend de** : T-01 · **Commits** : `1145313`
- **Fichiers** : `src/app/app/(admin)/{layout,monitoring/page,users/page}.tsx`, `components/app-sidebar.tsx`, `constants/sidebar.tsx`, `lib/session.ts`

Critères d’acceptation :
- [x] Layout `(admin)` qui vérifie le rôle côté serveur et redirige vers `/app` sinon.
- [x] Pages Monitoring et Utilisateurs (squelettes).
- [x] Groupes de sidebar marqués `adminOnly`, masqués hors rôle admin.
