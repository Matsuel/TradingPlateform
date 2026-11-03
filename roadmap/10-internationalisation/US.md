# 10 · Internationalisation du web (FR / EN) — User stories

> Sources : demande utilisateur du 2026-11-03 (feature urgente), maquette `30` à créer.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/web (app)` | Routes sans segment de langue ; `(auth)`, `(base)`, `layout.tsx`. | Dictionnaires, provider, cookie. |
| `apps/web/src/lib/format.ts` | `LOCALE = "fr-FR"` constante, formatteurs de devise, date et durée. | Locale en paramètre. |
| `apps/web/src/features/*` | Libellés en français dans `constants.ts`, `column.tsx`, `schema.ts` (zod). | Clés de traduction ; messages zod traduits. |
| `apps/web/src/constants/glossary.ts` | Entrées du glossaire (feature 09) en français. | Version EN de chaque entrée. |
| `core-backend / contracts` | Rien : la langue est une préférence d'affichage (D2). | Rien. |

## Hors périmètre

- Traduction des données de marché (noms d'entreprises venant de Yahoo).
- Traduction des messages d'erreur de l'API (chantier distinct, codes d'erreur stables).
- Langues autres que FR et EN.
- Préférence stockée en base et synchronisée entre appareils.

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Bibliothèque | `next-intl` | Standard App Router, gère les formats ICU ; un dictionnaire maison demanderait de réécrire pluriels et formats. Compatibilité Next 16 à vérifier avant T-01. |
| D2 | Stockage de la langue | Cookie `locale`, pas de colonne en base | Préférence d'affichage, pas une donnée métier : pas de migration, pas de route API. |
| D3 | Périmètre | Interface web seulement | Les messages d'erreur du backend restent en français ; les données (noms d'actifs) ne sont pas traduites. |

---

## User stories

### Lot 1 — Socle

#### US-01 · Choisir la langue de l'interface — MUST

**En tant que** utilisateur, **je veux** changer la langue de l'interface entre français et anglais **afin de** lire l'application dans la langue que je maîtrise..

Critères d’acceptation :
- [ ] Le choix FR / EN est dans les paramètres.
- [ ] Toutes les pages du parcours backtest et du marché sont entièrement dans la langue choisie.
- [ ] Le choix survit à un rechargement.

Tâches : T-01, T-02, T-03, T-05, T-06 (détail dans `TASKS.md`).

---

#### US-02 · Voir les nombres et dates au format de ma langue — MUST

**En tant que** utilisateur, **je veux** lire montants, pourcentages et dates au format de ma langue **afin de** ne pas me tromper sur un séparateur décimal..

Critères d’acceptation :
- [ ] Montants, pourcentages et dates suivent la locale active.
- [ ] La devise reste celle de la donnée (EUR ou USD), seul le format change.

Tâches : T-04 (détail dans `TASKS.md`).

---

### Lot 2 — Écrans

#### US-03 · Ajouter une page sans oublier une traduction — SHOULD

**En tant que** développeur, **je veux** qu'un test me signale une clé manquante **afin de** ne pas livrer une page à moitié traduite..

Critères d’acceptation :
- [ ] Le test T-07 échoue sur une clé absente d'une langue.

Tâches : T-07 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Choisir la langue de l'interface | MUST | 1 | web |
| US-02 | Voir les nombres et dates au format de ma langue | MUST | 1 | web |
| US-03 | Ajouter une page sans oublier une traduction | SHOULD | 2 | web |
