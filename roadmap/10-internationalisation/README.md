# 10 · Internationalisation et apparence du web (FR / EN, thème)

- **Statut** : Terminée
- **Roadmap** : Mois 5 · urgente — hors roadmap annuelle, demande du 2026-11-03 : interface traduisible avant toute nouvelle page ; demande du 2026-11-11 : onglet Apparence des Paramètres, comme sur la maquette
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/internationalisation` — PR à ouvrir
- **Points** : 45 (MUST 29, SHOULD 16) — prévus ; 50 réalisés sur 10 tâches (T-11 reste)
- **Maquettes** : `06.2 · Paramètres · Apparence` (node `129:2996` ; carte « Thème » et carte « Langue et région »). Ancienne `30 · Sélecteur de langue` (node `447:11464`) remplacée par la carte « Langue et région ».
- **Dépend de** : 09 (livrée). Passe avant 11 pour que les nouvelles pages naissent traduites.

## Objectif

L'utilisateur peut lire l'application en français ou en anglais, avec nombres et dates au format de sa langue, et choisir son thème (clair, sombre, système). Les deux choix vivent dans l'onglet Apparence des Paramètres. Le projet est pédagogique : un lecteur étranger doit pouvoir suivre les mêmes concepts.

## Comment

Web uniquement. `next-intl` (D1) fournit dictionnaires, cookie et formats ICU (pluriels, nombres). Langue lue dans `cookies()` côté serveur, pas de segment d'URL (D2). `lib/format.ts` reçoit la locale en paramètre au lieu de `LOCALE = "fr-FR"`. Le thème reste géré par `next-themes` (déjà en place) ; l'onglet Apparence remplace le `ThemeToggle` isolé comme point de réglage et y ajoute la langue (D4). Aucun changement de contrat ni de base, sauf T-11 (codes d'erreur, D5).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Bibliothèque** : `next-intl` | Standard App Router, gère les formats ICU ; un dictionnaire maison demanderait de réécrire pluriels et formats. Compatibilité Next 16 à vérifier avant T-01. | `US.md` (à valider) |
| D2 | **Stockage de la langue** : Cookie `locale`, pas de colonne en base | Préférence d'affichage, pas une donnée métier : pas de migration, pas de route API. | `US.md` (à valider) |
| D3 | **Périmètre** : Interface web seulement | Les messages d'erreur du backend restent en français ; les données (noms d'actifs) ne sont pas traduites. | `US.md` (à valider) |
| D4 | **Thème** : `next-themes` conservé, réglé depuis l'onglet Apparence | Déjà en place et persistant (navigateur) ; préférence d'affichage comme la langue : ni base ni route. Le `ThemeToggle` de la barre latérale reste en raccourci. | `US.md` (à valider) |
| D5 | **Erreurs de l'API** : code stable dans le corps, traduit par le web | Pas de paramètre ni d'en-tête de langue : le backend reste sans langue (T-11). | `US.md` (à valider) |

## Écarts au plan

- 2026-11-11 : T-06 coupée en deux. Le glossaire (T-09) devient une tâche à part, car `InfoHint` lit 417 lignes de texte français sur presque tous les écrans backtest. Ajout de T-10 (accueil et pages `/app/*` à venir) et T-11 (erreurs de l'API, D5), qui lève D3 pour les erreurs.
- 2026-11-11 : les formats (T-04) passent par `useFormatters()` plutôt qu'une locale globale, et les colonnes de tableau deviennent des hooks.
- Livré : T-01 à T-05, T-07, T-08 (`9999fd5` … `55fc201`). Parcours backtest entièrement traduit, hors textes d'aide.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
