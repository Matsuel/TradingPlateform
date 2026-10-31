# 08 · Portfolio Management V1

- **Statut** : Livrée
- **Roadmap** : Mois 4 — poids par actif, rebalancement, benchmark, CAGR, volatilité, durée de récupération et Sharpe
- **Période** : 2026-10-30 → 2026-10-31 (environ 4 semaines prévues)
- **Branche / PR** : `feat/portfolio-v1`, PR à ouvrir
- **Points** : 98 (MUST 80, SHOULD 18) prévus — réalisés 104 (MUST 84, SHOULD 20)
- **Maquettes** : `12.1 · Nouveau backtest · Allocation`, `13 · Résultats d’un backtest`, `19 · Comparaison de portefeuilles` (blocs du haut), `11 · Liste des backtests` ; remplacées pour le détail par `13 v2 · A · Héros + blocs groupés` (`350:7214`) et pour la comparaison par `19 v2 · Comparaison de backtests` (`360:7783`), validées le 31/10/2026

## Objectif

Passer du backtest équipondéré « achats seuls » à un vrai portefeuille : l’utilisateur fixe un poids par actif, choisit un rebalancement et un benchmark, et lit le rendement annualisé, la volatilité, le max drawdown avec sa durée de récupération et le Sharpe face au benchmark. C’est le dernier jalon du MVP (« Définition de terminé » du README).

## Comment

Ordre imposé par les dépendances : l’engine d’abord (pur et testé), puis contrat → base → API, puis l’affichage. Cinq lots : allocation, rebalancement, métriques, benchmark, comparaison et finitions. Le détail est dans [`US.md`](US.md) (point de départ, décisions D1 à D10, US) et [`TASKS.md`](TASKS.md) (31 tâches, chemin critique, graphe).

## Décisions

À valider avant le lot 1 : voir `US.md`, section « Décisions à valider avant de coder ». Les plus structurantes : D1 (table `BacktestAllocation` et suppression irréversible de `Backtest.symbols`), D5 (taux sans risque à 0), D8 (frais sur chaque ordre, achat ou vente), D9 (benchmark rejoué avec les mêmes flux).

D1 réintroduit sous un autre nom la table `BacktestAsset` (`symbol`, `weight`) du tout premier schéma (`30a42a7`), retirée lors du passage au mono-actif (`9a14a01`) : voir [05 · Strategy Lab MVP](../05-strategy-lab-mvp/README.md), « Écarts au plan ».

## Écarts au plan

- **Règle « Maquette d’abord »** (`1cae77c`) : ajoutée en cours de feature à `apps/web/AGENTS.md`. Les écrans non encore codés ont été redessinés et validés avant le code : détail d’un backtest (`13 v2 · A`), comparaison (`19 v2`).
- **Plus de cartes KPI** : la refonte du détail (T-25) regroupe les métriques en blocs Performance, Risque et Coûts (`BacktestResultBlocks`), avec la colonne du benchmark ; la page Comparaison remplace les cartes KPI de la maquette `19` par une colonne « Écart » A − B et une carte « Paramètres ». Les composants de T-19 et T-20 ont été remplacés (`ad18362`, `d753c02`).
- **Routes au singulier** : `POST /api/backtest`, `POST /api/backtest/preview`, `GET /api/backtest/compare`, sous le préfixe existant, et non `/api/backtests` comme dans `US.md`.
- **`hasResult` sur `GET /api/backtest`** (`881afae`) : ajouté après revue pour que la comparaison propose aussi un backtest relancé depuis son dernier résultat terminé.
- **`rebalanceCount`** (`1049a62`) : publié par l’engine et stocké en plus du plan, pour le bloc « Coûts et activité ».
- **Prisma sans `dotenv`** (`d3c2582`) : `prisma.config.ts` charge `.env` avec `process.loadEnvFile` ; il dépendait d’un `dotenv` non déclaré.

## Bilan

**Livré** : portefeuille multi-actifs à poids cibles (table `BacktestAllocation`, suppression de `Backtest.symbols`), rebalancement mensuel, trimestriel ou annuel avec ventes et frais sur chaque ordre, CAGR, volatilité, Sharpe (taux sans risque 0), durée de récupération et drawdown par point, benchmark rejoué avec les mêmes flux, page Comparaison de deux backtests, colonnes Allocation et CAGR dans la liste, récapitulatif prévisionnel du formulaire. Démo de bout en bout (T-30) : 60 % `AAPL` / 40 % `MSFT`, rebalancement annuel, frais 0,1 %, benchmark `URTH`, sur 2015–2025 : CAGR 25,08 % contre 8,06 %, Sharpe 0,974 contre 0,464 ; le rejeu d’un `backtest.requested` ne crée ni double exécution ni double résultat.

**Limites connues** (README, « Limites à rendre visibles ») : dividendes non inclus, taux sans risque à 0, actifs en USD affichés en EUR sans conversion (mois 5), rebalancement à la clôture du premier jour de la période.

**Dette** :
- `benchmark.excess*` est publié et stocké, mais affiché nulle part depuis la refonte du détail.
- Non vérifiés dans un navigateur : parcours de création d’un 60/40 (T-08), champ « Benchmark » (T-24), modes clair et sombre ; seul le responsive de la page Comparaison a été vérifié par l’utilisateur.
- Le sens favorable d’un écart (`comparedMetricHigherIsBetter`) vit dans le web : à exposer par l’API si un second client colore les écarts.
- `COMPARABLE_LIMIT` recopie `MAX_PAGE_SIZE` du contrat (le web n’importe pas le package à l’exécution).

**Points** : 104 réalisés pour 98 prévus (+6), surtout la refonte du détail (T-25) et la comparaison (T-27). Durée réelle : deux jours au lieu des quatre semaines prévues.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
