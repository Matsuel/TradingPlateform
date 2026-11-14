# 16 · Options vanilles : payoffs et Black-Scholes

- **Statut** : Planifiée
- **Roadmap** : Mois 9 — Mois 9 — Options (payoffs, Black-Scholes, grecques, volatilité implicite)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/options-vanilles` — PR à ouvrir
- **Points** : 21 (MUST 16, SHOULD 5) — prévus
- **Maquettes** : `36 · Calculateur d’option` (créée, node `459:12719`)
- **Écrans modifiés** : `08 · Détail d’un symbole` (node `13:1466`) : bouton « Pricer une option », spot et dividende pré-remplis (T-07) — dessiné dans la copie `à modifier (F16)` ; l’original est mis à jour au codage
- **Dépend de** : 11 (dividendes) ; 15 (taux, pipeline pricing).

## Objectif

L'utilisateur calcule le prix d'un call ou d'un put et voit son payoff. Ces deux objets sont la brique « billet de loto » d'un produit structuré.

## Comment

Moteur : `options.ts`, Black-Scholes et payoffs purs. Pas de chaîne d'options (D5). Demande via le pipeline pricing de 15, instrument `OPTION`. Web : calculateur.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Modèle** : Black-Scholes, européen, dividende continu q | Modèle de référence du cours. Dividendes discrets (ajustement du forward) reportés. | `US.md` (à valider) |
| D2 | **Volatilité** : Saisie par l'utilisateur, pré-remplie avec la volatilité historique | La volatilité implicite est traitée en 17 ; une valeur Yahoo brute n'est pas une source de vérité. | `US.md` (à valider) |
| D3 | **Options américaines** : Hors périmètre | Exercice anticipé : pas en MVP (voir README, COULD). | `US.md` (à valider) |
| D4 | **Pré-remplissage** : volatilité historique sur 1 an (annualisée, 252 jours ouvrés) et taux US 3 mois, tous deux modifiables | Une seule fenêtre : pas de sélecteur à coder ni tester. | Décision du 2026-11-14 |
| D5 | **Chaîne d'options** : absente de la 16, la route arrive en 17 avec le filtre de qualité | Évite d'afficher une chaîne brute incohérente avant son filtre. Le calculateur est 100 % saisi. | Décision du 2026-11-14 ; T-03 déplacée en 17 (T-08) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
