# 09 · Aide contextuelle sur les données

- **Statut** : Planifiée
- **Roadmap** : hors « Roadmap annuelle », demande du 2026-10-30 ; à mener juste après le lot 3 de la feature 08 (métriques), avant le mois 5. Sert l’objectif pédagogique n° 1 (« implémenter et expliquer »).
- **Période** : à planifier (environ 1 semaine)
- **Branche / PR** : à créer
- **Points** : 21 (MUST 19, SHOULD 2) — prévus
- **Maquettes** : `26 · Aide sur une donnée (sheet)`

## Objectif

L’écran de résultat aligne déjà une dizaine de chiffres (rendement total, drawdown max, écart du DCA, empreinte des données…), et la feature 08 en ajoute cinq. L’utilisateur s’y perd. À la fin, chaque donnée calculée porte une icône d’aide : un clic ouvre un panneau qui dit à quoi sert la donnée, comment elle est calculée, son unité et comment la lire.

## Comment

Front seul : aucune valeur métier nouvelle. Un catalogue de textes `constants/glossary.ts` (D1), un composant partagé `InfoHint` qui ouvre `AppSheet` (D2), un emplacement `info` dans `StatCard`, puis le branchement écran par écran (résultat, liste, marché, formulaire). Chaque texte cite le symbole de l’engine ou du service qui calcule la donnée, pour rester vrai quand le calcul change ; la règle de maintenance entre dans `apps/web/AGENTS.md` (T-09).

## Décisions

À valider avant de coder : `US.md`, section « Décisions à valider » (D1 à D7).

## Écarts au plan

Aucun pour l’instant.

## Bilan

À remplir à la clôture (skill `feature-roadmap`, mode clôture).

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
