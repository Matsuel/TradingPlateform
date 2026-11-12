# 12 · Robustesse : dates de départ et métriques glissantes

- **Statut** : Planifiée
- **Roadmap** : Mois 5 — Mois 5 — Robustesse (comparaison de dates de départ, métriques glissantes)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/robustesse-dates-de-depart` — PR à ouvrir
- **Points** : 27 (MUST 21, SHOULD 6) — prévus
- **Maquettes** : `32 · Robustesse` (créée, node `453:11911`)
- **Écrans modifiés** : `12 · Nouveau backtest` (node `297:5995`) : choix « plusieurs dates de départ » (T-06 modifie `new-backtest-form.tsx`) ; `13 · Résultat d’un backtest` (node `350:7214`) : accès à la page de lot 32 (point d’entrée non précisé dans les US) — à dessiner
- **Dépend de** : 11 (dividendes, rendements corrects).

## Objectif

L'utilisateur mesure la sensibilité d'une stratégie à sa date d'entrée, et voit le pire cas sur des fenêtres glissantes. C'est la première preuve qu'un bon résultat n'est pas un coup de chance.

## Comment

Le moteur calcule les fenêtres glissantes (fonction pure). `core-backend` crée un lot de backtests liés et agrège leurs résultats ; le web affiche. Aucune métrique n'est recalculée côté web.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Lot de départs** : N backtests liés par `batchId`, pas un calcul moteur unique | Réutilise le pipeline existant (un `backtest.requested` par départ) : pas de nouveau topic, rejeu déjà géré. | `US.md` (à valider) |
| D2 | **Pas des fenêtres** : Un jour ouvré | Un pas plus grand masquerait les pires entrées. Coût de calcul acceptable sur 10 ans. | `US.md` (à valider) |
| D3 | **Périodes** : 1, 3 et 5 ans seulement | Trois durées suffisent pour l'objectif pédagogique ; pas de paramètre libre. | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
