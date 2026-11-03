# 10 · Internationalisation du web (FR / EN)

- **Statut** : Planifiée
- **Roadmap** : Mois 5 · urgente — hors roadmap annuelle, demande du 2026-11-03 : interface traduisible avant toute nouvelle page
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/internationalisation` — PR à ouvrir
- **Points** : 28 (MUST 23, SHOULD 5) — prévus
- **Maquettes** : `30 · Sélecteur de langue` (existe déjà dans Figma)
- **Dépend de** : 09 (livrée). Passe avant 11 pour que les nouvelles pages naissent traduites.

## Objectif

L'utilisateur peut lire l'application en français ou en anglais, avec nombres et dates au format de sa langue. Le projet est pédagogique : un lecteur étranger doit pouvoir suivre les mêmes concepts.

## Comment

Web uniquement. `next-intl` (D1) fournit dictionnaires, cookie et formats ICU (pluriels, nombres). Langue lue dans `cookies()` côté serveur, pas de segment d'URL (D2). `lib/format.ts` reçoit la locale en paramètre au lieu de `LOCALE = "fr-FR"`. Aucun changement de contrat ni de base.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Bibliothèque** : `next-intl` | Standard App Router, gère les formats ICU ; un dictionnaire maison demanderait de réécrire pluriels et formats. Compatibilité Next 16 à vérifier avant T-01. | `US.md` (à valider) |
| D2 | **Stockage de la langue** : Cookie `locale`, pas de colonne en base | Préférence d'affichage, pas une donnée métier : pas de migration, pas de route API. | `US.md` (à valider) |
| D3 | **Périmètre** : Interface web seulement | Les messages d'erreur du backend restent en français ; les données (noms d'actifs) ne sont pas traduites. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
