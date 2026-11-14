# 18 · Pricing Monte Carlo et option à barrière

- **Statut** : Planifiée
- **Roadmap** : Mois 10 — Mois 10 — Pricing et produits structurés (Monte Carlo validé contre Black-Scholes, option à barrière)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/pricing-monte-carlo-barriere` — PR à ouvrir
- **Points** : 22 (MUST 19, SHOULD 3) — prévus
- **Maquettes** : `38 · Pricing Monte Carlo` (créée, node `462:13129`)
- **Écrans modifiés** : `36 · Calculateur d’option` (node `459:12719`) : bouton « Pricing Monte Carlo » vers la page 38 — dessiné dans la copie `à modifier (F18)` ; l’original est mis à jour au codage
- **Dépend de** : 14 (moteur Monte Carlo, PRNG) ; 16 (Black-Scholes sert de référence).

## Objectif

L'utilisateur price une option par simulation et voit pourquoi cette méthode est indispensable dès qu'il n'existe pas de formule. Les options à barrière sont la brique des produits structurés.

## Comment

Moteur : trajectoires GBM réutilisant le PRNG de 14, prix moyen actualisé, barrière surveillée chaque jour. Demande via le pipeline pricing (`method`). Web affiche méthode et erreur standard.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Dynamique** : GBM sous mesure neutre au risque (dérive r − q) | Standard pour le pricing ; le bootstrap de 14 sert à la projection, pas au pricing. | `US.md` (à valider) |
| D2 | **Barrière** : Surveillance quotidienne | Les barrières réelles sont souvent observées à la clôture ; une surveillance continue sous-estime le risque de dépassement. | `US.md` (à valider) |
| D3 | **Validation** : Écart inférieur à 3 erreurs standard vers Black-Scholes | Critère statistique, pas un seuil arbitraire en euros. | `US.md` (à valider) |
| D4 | **Trajectoires** : 100 000 par défaut, réglable de 10 000 à 1 000 000 ; seed fixe stockée avec le résultat | Résultat rejouable ; le réglage montre la convergence de l'erreur standard. | Décision du 2026-11-14 |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
