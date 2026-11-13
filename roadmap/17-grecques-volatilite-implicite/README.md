# 17 · Grecques, volatilité implicite et smile

- **Statut** : Planifiée
- **Roadmap** : Mois 9 — Mois 9 — Options (grecques, volatilité implicite, smile et surface)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/grecques-volatilite-implicite` — PR à ouvrir
- **Points** : 24 (MUST 19, SHOULD 5) — prévus
- **Maquettes** : `37 · Grecques et smile` (créée, node `461:12922`)
- **Écrans modifiés** : `36 · Calculateur d’option` (node `459:12719`) : bouton « Volatilité implicite » vers la page 37 — dessiné dans la copie `à modifier (F17)` ; l’original est mis à jour au codage
- **Dépend de** : 16 (options vanilles).

## Objectif

L'utilisateur voit ce que le marché anticipe (volatilité implicite), comment le prix réagit (grecques), et pourquoi le modèle de base est imparfait (smile). C'est le tableau de bord du structureur.

## Comment

Moteur : inversion de Black-Scholes et grecques (fonctions pures). Filtre de qualité avant tout calcul. Chaîne calculée par le worker via le pipeline pricing. Web affiche.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Volatilité implicite** : Calculée par le moteur (bisection) | Les données Yahoo sont incohérentes : sur SPY, 91 contrats sur 220 ont une IV nulle ou aberrante (14 juil. 2026, séance non confirmée). | `US.md` (à valider) |
| D2 | **Filtre** : Prix nul, bid/ask nuls, IV hors [1 %, 300 %] écartés et comptés | Un filtre visible vaut mieux qu'un nettoyage silencieux. | `US.md` (à valider) |
| D3 | **Surface** : Smile 2D par échéance, pas de surface 3D | Une courbe par échéance suffit pour voir le smile ; la 3D est coûteuse à lire et à tester. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
