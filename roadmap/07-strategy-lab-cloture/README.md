# 07 · Clôture du Strategy Lab

- **Statut** : Livrée
- **Roadmap** : Mois 3 — comparaison DCA / investissement unique, total des frais, quantités accumulées, règle d’exécution et source des données affichées, tests de reproductibilité
- **Période** : 2026-10-29 → 2026-10-30
- **Branche / PR** : `feat/backtest` — #3 (merge `e67e950`) ; recadrage du README en commits directs
- **Points** : 24 (MUST 24) — estimés a posteriori
- **Maquettes** : `13 · Résultats d’un backtest` (cartes, tableaux)

## Objectif

Rendre le résultat d’un backtest complet, explicable et reproductible : ce qu’ont coûté les frais, ce qui est détenu à la fin, si le DCA a fait mieux qu’un investissement unique, sous quelles hypothèses, et la preuve que les mêmes entrées donnent le même résultat. En parallèle, le projet pivote vers le laboratoire de portefeuille.

## Comment

- **Pivot** : le README est réécrit autour du laboratoire de portefeuille (explorateur d’allocations, métriques glissantes, Monte Carlo, notifications, règle d’exécution) ; la bourse simulée devient un module bonus (`472715b` → `9c8571e`).
- **Frais et positions** : l’engine somme les frais de chaque achat (`totalFees`), publie la quantité, le montant et les frais de chaque achat, et les positions finales valorisées au dernier cours (`holdings`) ; colonnes ajoutées à `BacktestResult`, cartes et tableaux côté web (`9819b57`, `61de5af`).
- **DCA vs investissement unique** : pour un backtest récurrent, l’engine rejoue le même total versé en un seul achat au premier jour, mêmes cours et frais ; il publie `lumpSumComparison` (valeur finale, rendement, drawdown, avantage du DCA) et `lumpSumValue` sur chaque point de courbe (courbe en pointillés) (`f1f640d`, `1a6c412`).
- **Taille des messages** : un DCA quotidien sur 46 ans produisait un `backtest.completed` d’environ 1,1 Mo, refusé par le broker ; le producteur compresse en GZIP (~190 Ko) (`e87fdcc`).
- **Revue** : `round`, `periodKey` et un tracker de drawdown extraits dans `backtest.utils.ts` avec tests ; profit calculé par l’engine et non par le web ; types web dérivés des contrats ; règles documentées dans les `AGENTS.md` (`1a6c412`, `1987a7b`).
- **Hypothèses et reproductibilité** : contrat `executionRule` (`CLOSE_ON_SCHEDULED_DAY`) et `dataSource` (fournisseur, type de cours, date de récupération, empreinte SHA-256 des séries) ; carte « Hypothèses » côté web ; jeu de données de référence déterministe avec métriques figées, tests de déterminisme, d’immutabilité des entrées et de stabilité de l’empreinte (`01fcb91`).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | Pivot vers le laboratoire de portefeuille ; bourse simulée en bonus. | Objectif d’apprentissage : gestion d’actifs plutôt que plateforme de trading. | `5f0890c` |
| D2 | Décisions planifiées exécutées à la clôture du jour de l’échéance ; T+1 réservé aux décisions fondées sur un cours. | Pas de look-ahead : la date d’un versement est connue à l’avance. | `9c8571e`, `01fcb91` |
| D3 | Comparaison DCA à total versé identique, mêmes frais. | Seule la répartition dans le temps change. | `f1f640d` |
| D4 | Valeur de l’investissement unique portée par chaque point de courbe. | Mêmes dates par construction ; message ~15 % plus petit qu’une seconde courbe. | `1a6c412` |
| D5 | Résultats stockés qui évoluent : colonnes nullables, champ optionnel côté web, `<Dash />` pour un résultat antérieur. | Pas de recalcul ni de migration de données des anciens résultats. | `1987a7b` |
| D6 | Empreinte SHA-256 des cours publiée avec le résultat. | Même empreinte = mêmes données d’entrée : résultat comparable et explicable. | `01fcb91` |

## Écarts au plan

Aucun sur le périmètre du mois 3. La compression GZIP n’était pas prévue : elle a été imposée par la limite de taille du broker.

## Bilan

Strategy Lab clôturé ; les trois premières cases de la « Définition de terminé » du MVP sont couvertes côté backtest. Limites : portefeuille toujours équipondéré, achats seulement (traité par la feature 08), dividendes non inclus.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
