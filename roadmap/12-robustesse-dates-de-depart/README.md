# 12 · Robustesse : dates de départ et métriques glissantes

- **Statut** : Livrée
- **Roadmap** : Mois 5 — Mois 5 — Robustesse (comparaison de dates de départ, métriques glissantes)
- **Période** : 2026-11-13
- **Branche / PR** : `feat/robustesse-dates-de-depart` — PR #10
- **Points** : 27 prévus (MUST 21, SHOULD 6) ; 36 réalisés
- **Maquettes** : `32 · Robustesse` (créée, node `453:11911`)
- **Écrans modifiés** : `12 · Nouveau backtest` (node `297:5995`) : interrupteur « Plusieurs dates de départ » sous Début/Fin (T-06 modifie `new-backtest-form.tsx`) ; `13 · Résultat d’un backtest` (node `350:7214`) : bouton « Robustesse » vers la page de lot 32 — dessiné dans la copie `à modifier (F12)` ; l’original est mis à jour au codage
- **Dépend de** : 11 (dividendes, rendements corrects).

## Objectif

L'utilisateur mesure la sensibilité d'une stratégie à sa date d'entrée, et voit le pire cas sur des fenêtres glissantes. C'est la première preuve qu'un bon résultat n'est pas un coup de chance.

## Comment

Le moteur calcule les fenêtres glissantes (fonction pure). `core-backend` crée un lot de backtests liés et agrège leurs résultats ; le web affiche. Aucune métrique n'est recalculée côté web.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Lot de départs** : N backtests liés par `batchId`, pas un calcul moteur unique | Réutilise le pipeline existant (un `backtest.requested` par départ) : pas de nouveau topic, rejeu déjà géré. | `d840be9` |
| D2 | **Pas des fenêtres** : Un jour ouvré | Un pas plus grand masquerait les pires entrées. Coût de calcul acceptable sur 10 ans. | `d840be9` |
| D4 | **Départ ≥ 1 an avant la fin commune** (maquette 32 : « Refusé : moins d’un an avant la fin commune ») | Sous un an, le CAGR n'est qu'une extrapolation. Règle imposée par core-backend (`START_TOO_CLOSE_TO_END`), miroir ergonomique dans le web. | maquette 32 |
| D5 | **Fenêtres glissantes en rendement annualisé**, avec la courbe par date d'entrée | Seul le rendement annualisé compare des durées différentes ; la courbe de la maquette 32 en a besoin. | maquette 32 |
| D3 | **Périodes** : 1, 3 et 5 ans seulement | Trois durées suffisent pour l'objectif pédagogique ; pas de paramètre libre. | `d840be9` |

## Écarts au plan

Voir « Écarts réalisés » dans `TASKS.md` : relance d'un lot, ajout de départs et sélecteur de date partagé, non prévus.

## Bilan

Une stratégie se lance sur 2 à 10 dates de départ liées par `batchId` ; la page du lot (maquette 32) affiche CAGR, volatilité et drawdown par départ, rangs, synthèse (médiane, écart, pire départ) et la distribution des fenêtres glissantes de 1, 3 et 5 ans en rendement annualisé (`backtest.rolling.ts`, fonction pure testée), avec la courbe par date d'entrée. `core-backend` refuse un départ à moins d'un an de la fin commune (`START_TOO_CLOSE_TO_END`) ; `rollingSummary` et `batchId` sont nullables, les anciens résultats restent valides. Commit : `d840be9` ; les refactors qui ont suivi (`1351f6b`, `3056d22`, `a045b8d`, `f527181`, `fea94c0`) ne changent pas le comportement.

36 points réalisés pour 27 prévus : relance, ajout de départs et nouveau lot, plus le sélecteur de date partagé. Reste : l'écran 32 et les écrans 12 et 13 modifiés n'ont pas été comparés à une capture de l'app lancée (« non comparé »). Dette : TD-31 (comparaison Figma de la page du lot, retrait d'une date). Appliquer la migration du lot, puis redémarrer core-backend et backtest-engine.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
