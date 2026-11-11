# 10 · Internationalisation et apparence du web (FR / EN, thème) — User stories

> Sources : demande utilisateur du 2026-11-03 (feature urgente), demande du 2026-11-11 (onglet Apparence), maquette `06.2 · Paramètres · Apparence` (`129:2996`), validée le 11/11/2026.

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
| D5 | Erreurs de l'API | Code d'erreur stable dans le corps (`code`), traduit par le web ; ni en-tête `Accept-Language` ni paramètre de requête | Le backend reste sans langue, toutes les traductions vivent dans les mêmes dictionnaires, le code sert aussi aux logs et aux tests. Remplace D3 pour les erreurs (T-11, SHOULD). |

---

## User stories

### Lot 1 — Socle

#### US-01 · Choisir la langue de l'interface — MUST

**En tant que** utilisateur, **je veux** changer la langue de l'interface entre français et anglais **afin de** lire l'application dans la langue que je maîtrise..

Critères d’acceptation :
- [x] Le choix FR / EN est dans Paramètres > Apparence, carte « Langue et région » (maquette `06.2`).
- [x] Le parcours backtest (liste, formulaires, détail, comparaison), le marché et les textes d'aide sont dans la langue choisie.
- [x] La page d'accueil et les pages `/app/*` à venir sont dans la langue choisie.
- [x] Le choix survit à un rechargement.

Tâches : T-01, T-02, T-03, T-05, T-06, T-09, T-10 (détail dans `TASKS.md`).

---

#### US-02 · Voir les nombres et dates au format de ma langue — MUST

**En tant que** utilisateur, **je veux** lire montants, pourcentages et dates au format de ma langue **afin de** ne pas me tromper sur un séparateur décimal..

Critères d’acceptation :
- [x] Montants, pourcentages et dates suivent la locale active.
- [x] La devise reste celle de la donnée (EUR ou USD), seul le format change.

Tâches : T-04 (détail dans `TASKS.md`).

---

### Lot 2 — Écrans

#### US-03 · Ajouter une page sans oublier une traduction — SHOULD

**En tant que** développeur, **je veux** qu'un test me signale une clé manquante **afin de** ne pas livrer une page à moitié traduite..

Critères d’acceptation :
- [x] Le test T-07 échoue sur une clé absente d'une langue.

Tâches : T-07 (détail dans `TASKS.md`).

---

#### US-04 · Choisir le thème de l'interface — MUST

**En tant que** utilisateur, **je veux** choisir entre thème clair, sombre ou système depuis les paramètres **afin de** lire l'application confortablement.

Critères d’acceptation :
- [x] Paramètres > Apparence affiche la carte « Thème » avec trois aperçus : Clair, Sombre, Système (maquette `06.2`).
- [x] Le thème actif est mis en évidence ; un clic l'applique sans recharger la page.
- [x] Le choix survit à un rechargement ; « Système » suit le réglage de l'OS.
- [x] Libellés et description traduits en FR et EN.

Tâches : T-08 (détail dans `TASKS.md`).

---

#### US-05 · Voir les erreurs de l'API dans ma langue — SHOULD

**En tant que** utilisateur, **je veux** que les erreurs renvoyées par le serveur s'affichent dans la langue de l'interface **afin de** comprendre ce qui a échoué.

Critères d’acceptation :
- [ ] Une erreur de l'API (backtest introuvable, exécution en cours, validation) s'affiche dans la langue choisie.
- [ ] Une erreur sans traduction connue affiche un message générique traduit.

Tâches : T-11 (détail dans `TASKS.md`).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Choisir la langue de l'interface | MUST | 1 | web |
| US-02 | Voir les nombres et dates au format de ma langue | MUST | 1 | web |
| US-03 | Ajouter une page sans oublier une traduction | SHOULD | 2 | web |
| US-04 | Choisir le thème de l'interface | MUST | 1 | web |
| US-05 | Voir les erreurs de l'API dans ma langue | SHOULD | 3 | backend, web |
