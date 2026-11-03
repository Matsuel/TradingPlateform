# 19 · Produits structurés : décomposition, juste valeur, marge

- **Statut** : Planifiée
- **Roadmap** : Mois 10 — Mois 10 — Pricing et produits structurés (capital garanti, reverse convertible, autocallable, juste valeur et marge)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/produits-structures` — PR à ouvrir
- **Points** : 29 (MUST 29, SHOULD 0) — prévus
- **Maquettes** : `39 · Constructeur de produit` (créée, node `465:13338`)
- **Dépend de** : 15 (obligation), 17 (grecques, IV), 18 (Monte Carlo, barrière).

## Objectif

L'utilisateur assemble un produit structuré à partir de briques, voit sa décomposition, sa juste valeur et la marge de celui qui le vend. C'est l'objectif central du projet pour le métier de structureur.

## Comment

Moteur : produits comme assemblages de briques (`structured.ts`) ; autocallable par Monte Carlo (`structured-mc.ts`). Contrat décomposé, persistance côté core-backend, affichage web sans calcul.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Types livrés** : Capital garanti, reverse convertible, autocallable | Les trois couvrent zéro-coupon, vente de put et barrière. Worst-of reporté (COULD). | `US.md` (à valider) |
| D2 | **Participation** : Calculée par le moteur : budget d'option divisé par le prix du call | Formule simple et lisible : elle montre le compromis garantie / participation. | `US.md` (à valider) |
| D3 | **Autocallable** : Monte Carlo avec dates d'observation | Un autocallable n'a pas de formule fermée. | `US.md` (à valider) |
| D4 | **Marge** : Prix client − juste valeur, en devise et en % | Affiche la rémunération sans la faire passer pour un conseil. Hypothèses de financement et de couverture non incluses. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
