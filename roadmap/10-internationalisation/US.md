# 10 · Internationalisation et apparence du web (FR / EN, thème) — User stories

> Sources : demande utilisateur du 2026-11-03 (feature urgente), demande du 2026-11-11 (onglet Apparence), maquette `06.2 · Paramètres · Apparence` (`129:2996`).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/web (app)` | Routes sans segment de langue ; `(auth)`, `(base)`, `layout.tsx`. | Dictionnaires, provider, cookie. |
| `apps/web/src/app/app/settings/page.tsx` | Page Paramètres squelette (feature 02), sans onglets. | Onglets (Apparence seul), cartes « Thème » et « Langue et région » (maquette `06.2`). |
| `apps/web/src/components/theme-toggle.tsx` | `ThemeToggle` (menu clair / sombre / système, `next-themes`) dans `app-sidebar.tsx`, libellés en dur. | Choix visuel de thème dans Paramètres ; libellés traduits. |
| `apps/web/src/lib/format.ts` | `LOCALE = "fr-FR"` constante, formatteurs de devise, date et durée. | Locale en paramètre. |
| `apps/web/src/features/*` | Libellés en français dans `constants.ts`, `column.tsx`, `schema.ts` (zod). | Clés de traduction ; messages zod traduits. |
| `apps/web/src/constants/glossary.ts` | Entrées du glossaire (feature 09) en français. | Version EN de chaque entrée. |
| `core-backend / contracts` | Rien : la langue est une préférence d'affichage (D2). | Rien. |

## Hors périmètre

- Traduction des données de marché (noms d'entreprises venant de Yahoo).
- Traduction des messages d'erreur de l'API (chantier distinct, codes d'erreur stables).
- Langues autres que FR et EN.
- Onglets Profil, Portefeuille et Notifications des Paramètres (maquettes `06`, `06.1`, `29`) : features ultérieures ; la barre d'onglets n'affiche que ceux qui existent.
- Thème stocké en base ou synchronisé entre appareils.
- Préférence stockée en base et synchronisée entre appareils.

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Bibliothèque | `next-intl` | Standard App Router, gère les formats ICU ; un dictionnaire maison demanderait de réécrire pluriels et formats. Compatibilité Next 16 à vérifier avant T-01. |
| D2 | Stockage de la langue | Cookie `locale`, pas de colonne en base | Préférence d'affichage, pas une donnée métier : pas de migration, pas de route API. |
| D3 | Périmètre | Interface web seulement | Les messages d'erreur du backend restent en français ; les données (noms d'actifs) ne sont pas traduites. |
| D4 | Thème | `next-themes` conservé, réglé depuis l'onglet Apparence ; `ThemeToggle` gardé en raccourci | Déjà en place et persistant côté navigateur ; préférence d'affichage, ni base ni route. |

---

## User stories

### Lot 1 — Socle

#### US-01 · Choisir la langue de l'interface — MUST

**En tant que** utilisateur, **je veux** changer la langue de l'interface entre français et anglais **afin de** lire l'application dans la langue que je maîtrise..

Critères d’acceptation :
- [ ] Le choix FR / EN est dans Paramètres > Apparence, carte « Langue et région » (maquette `06.2`).
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

#### US-04 · Choisir le thème de l'interface — MUST

**En tant que** utilisateur, **je veux** choisir entre thème clair, sombre ou système depuis les paramètres **afin de** lire l'application confortablement.

Critères d’acceptation :
- [ ] Paramètres > Apparence affiche la carte « Thème » avec trois aperçus : Clair, Sombre, Système (maquette `06.2`).
- [ ] Le thème actif est mis en évidence ; un clic l'applique sans recharger la page.
- [ ] Le choix survit à un rechargement ; « Système » suit le réglage de l'OS.
- [ ] Libellés et description traduits en FR et EN.

Tâches : T-08 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Choisir la langue de l'interface | MUST | 1 | web |
| US-02 | Voir les nombres et dates au format de ma langue | MUST | 1 | web |
| US-03 | Ajouter une page sans oublier une traduction | SHOULD | 2 | web |
| US-04 | Choisir le thème de l'interface | MUST | 1 | web |
