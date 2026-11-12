# 11 · Dividendes, splits et effet devise

- **Statut** : En cours (code livré sur la branche, PR à ouvrir)
- **Roadmap** : Mois 5 — Mois 5 — Robustesse (dividendes, splits, effet devise)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/dividendes-splits-devise` — PR à ouvrir
- **Points** : 24 (MUST 18, SHOULD 6) — prévus
- **Maquettes** : `31 · Résultat avec dividendes` (node `452:11711`) = page « Dividendes et change », ouverte par un bouton ajouté au cadre `13` (node `350:7231`)
- **Écrans modifiés** : `13 · Résultat d’un backtest` (node `350:7214`) : bouton « Dividendes et change » vers la page 31 — mise à jour faite
- **Dépend de** : 08 (livrée) ; 10 (i18n) pour les nouveaux libellés.

## Objectif

L'utilisateur voit le rendement réel d'un titre, dividendes compris, et la part due au change pour un actif en dollars. Sans cela, toutes les métriques des features 08 à 14 sont fausses pour les titres qui versent des dividendes.

## Comment

Moteur : `chart` avec `events: 'div|split'`, réinvestissement dans `runBacktest`, conversion EUR/USD par série journalière. Contrat : `priceType` enrichi (ajout). Base : deux colonnes nullables. Web : deux lignes d'affichage.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Dividendes** : Réinvestis au cours de l'ex-date, sans frais | Un réinvestissement est un rachat ; le frais par ordre (D8 de 08) s'applique aux ordres de stratégie, pas aux dividendes. Option « encaissés en cash » reportée. | `US.md` (à valider) |
| D2 | **Type de cours** : Ajout de `TOTAL_RETURN` à `priceType` | Ajout pur : les résultats `CLOSE_SPLIT_ADJUSTED` restent lisibles, sans recalcul. | `US.md` (à valider) |
| D3 | **Devise de référence** : EUR ; conversion au cours du jour | Cohérent avec le hors périmètre (comptes mono-devise EUR). Pas de conversion au cours de départ (non demandé). | `US.md` (à valider) |

## Écarts au plan

- **Signe du change** : contribution = rendement EUR − rendement local (et non l'inverse de T-04), pour que « local + contribution = EUR » (critère d'US-02) tienne.
- **Devise dans la route des dividendes** : `GET /api/market/dividends` renvoie aussi `currency` par symbole (`chart.meta.currency`), sans quoi le moteur ne sait pas quels actifs convertir ; les taux `EURxxx=X` passent par `closes`.
- **`PRICE_DATA_SOURCE.priceType` devient `TOTAL_RETURN`** : l'aperçu annonce ce que le moteur calcule désormais.
- **Empreinte** : `fingerprintMarket` couvre cours, dividendes et taux de change.
- **Splits** : aucun traitement propre, les clôtures et montants de dividendes Yahoo sont déjà ajustés.
- **Page dédiée** (décision de l'utilisateur) : l'affichage vit dans `/app/backtest/<id>/dividends` (`BacktestDividends`), atteinte par le bouton « Dividendes et change » du détail, visible si le résultat a des dividendes ou un effet de change. Les maquettes 13 (bouton) et 31 (en-tête, fil d'Ariane) ont été mises à jour.
- **Données ajoutées au résultat** pour cette page, toutes calculées par le moteur : `priceReturn`, `dividendTotal`, `dividendGain`, `dividendEvents` (un par ex-date et par actif), `returnBreakdown` (`price`, `dividends`, `local`, `fx`), `priceOnlyValue` par point de courbe. Colonnes nullables (Json pour les deux structures) dans une migration additive.
- **Carte « Nouvelles lignes de métriques » écartée** (décision de l'utilisateur) : retirée de la maquette 31 ; les anciens résultats masquent déjà ces données.
- **Écart d'affichage** : le badge « EUR/USD » et les libellés « change EUR/USD » de la maquette sont génériques dans le code (« Effet de change »), le moteur ne publie pas les devises converties.
- **Devises en sous-unité (TD-26, fermée)** : market-service ramène `GBp`/`GBX`/`ILA`/`ZAc` à `GBP`/`ILS`/`ZAR` en divisant cours et dividendes par 100 (`utils/currency.ts`).

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
