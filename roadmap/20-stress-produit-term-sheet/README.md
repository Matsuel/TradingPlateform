# 20 · Stress de produit et term sheet

- **Statut** : Planifiée
- **Roadmap** : Mois 10 — Mois 10 — Pricing et produits structurés (term sheet, stress de scénarios)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/stress-produit-term-sheet` — PR à ouvrir
- **Points** : 19 (MUST 15, SHOULD 4) — prévus
- **Maquettes** : `40 · Term sheet` (créée, node `467:13542`)
- **Écrans modifiés** : `39 · Constructeur de produit` (node `465:13338`) : lien vers la term sheet 40 (non dessiné) — à dessiner
- **Dépend de** : 13 (Risk Engine, vocabulaire du stress) ; 19 (produit à stresser).

## Objectif

L'utilisateur voit comment un produit réagit à des chocs et lit sa fiche comme un vrai structureur. Le stress révèle l'exposition cachée ; la term sheet apprend à lire un produit.

## Comment

Moteur : repricing du produit dans quatre scénarios fixes. Core-backend assemble la fiche. Web affiche, sans recalcul.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Scénarios** : Quatre chocs fixes, non paramétrables | Évite une configuration pour une valeur fixe ; une option « scénario personnalisé » reste COULD. | `US.md` (à valider) |
| D2 | **Format de la fiche** : Page web, pas de PDF | Pas de dépendance d'export en MVP ; un PDF viendra si besoin. | `US.md` (à valider) |
| D3 | **Scénarios de performance** : Favorable, neutre, défavorable calculés par le repricing | Les trois valeurs viennent du même moteur que le stress. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
