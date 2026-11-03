# 16 · Options vanilles : payoffs et Black-Scholes

- **Statut** : Planifiée
- **Roadmap** : Mois 9 — Mois 9 — Options (payoffs, Black-Scholes, grecques, volatilité implicite)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/options-vanilles` — PR à ouvrir
- **Points** : 24 (MUST 19, SHOULD 5) — prévus
- **Maquettes** : `36 · Calculateur d'option` (maquette non faite : à créer)
- **Dépend de** : 11 (dividendes) ; 15 (taux, pipeline pricing).

## Objectif

L'utilisateur calcule le prix d'un call ou d'un put et voit son payoff. Ces deux objets sont la brique « billet de loto » d'un produit structuré.

## Comment

Moteur : `options.ts`, Black-Scholes et payoffs purs. Chaîne d'options lue par `market-service` (indicative). Demande via le pipeline pricing de 15, instrument `OPTION`. Web : calculateur.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Modèle** : Black-Scholes, européen, dividende continu q | Modèle de référence du cours. Dividendes discrets (ajustement du forward) reportés. | `US.md` (à valider) |
| D2 | **Volatilité** : Saisie par l'utilisateur, pré-remplie avec la volatilité historique | La volatilité implicite est traitée en 17 ; une valeur Yahoo brute n'est pas une source de vérité. | `US.md` (à valider) |
| D3 | **Options américaines** : Hors périmètre | Exercice anticipé : pas en MVP (voir README, COULD). | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
