# 11 · Dividendes, splits et effet devise — User stories

> Sources : `roadmap/08-portfolio-v1/README.md` (limites connues : dividendes non inclus, actifs en USD affichés en EUR sans conversion), README racine (Strategy Lab SHOULD : dividendes ; Portefeuille SHOULD : effet devise).

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `packages/contracts/src/backtest.ts` | `dataSourceSchema.priceType` = `CLOSE_SPLIT_ADJUSTED` seul ; `PRICE_DATA_SOURCE`. | Valeur `TOTAL_RETURN`, champs de résultat. |
| `apps/backtest-engine/repositories/market.repository.ts` | `chart` en `interval: '1d'`, clôtures seules ; aucun `events`. | Dividendes, paire EUR/USD. |
| `apps/backtest-engine/engine/backtest.engine.ts` | `runBacktest(params, prices)` : achats, ventes, rebalancement, TWR. | Traitement des dividendes et du change. |
| `apps/core-backend/prisma/schema.prisma` | `BacktestResult` sans colonne dividendes ni change. | `dividendTotal`, `fxContribution` nullables. |
| `apps/web/src/features/backtest/result-metrics.tsx` | Métriques de performance et de risque. | Deux lignes conditionnelles. |

## Hors périmètre

- Dividendes encaissés en cash (D1, option future).
- Conversion des comptes et du ledger en devise autre que EUR.
- Taxes sur dividendes ou retenue à la source.
- Changement du repository engine vers `market-service` : écart existant à traiter dans un chantier séparé (le moteur appelle Yahoo directement).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Dividendes | Réinvestis au cours de l'ex-date, sans frais | Un réinvestissement est un rachat ; le frais par ordre (D8 de 08) s'applique aux ordres de stratégie, pas aux dividendes. Option « encaissés en cash » reportée. |
| D2 | Type de cours | Ajout de `TOTAL_RETURN` à `priceType` | Ajout pur : les résultats `CLOSE_SPLIT_ADJUSTED` restent lisibles, sans recalcul. |
| D3 | Devise de référence | EUR ; conversion au cours du jour | Cohérent avec le hors périmètre (comptes mono-devise EUR). Pas de conversion au cours de départ (non demandé). |

---

## User stories

### Lot 1 — Contrat

#### US-01 · Voir le rendement réel de mon investissement — MUST

**En tant que** utilisateur, **je veux** voir le rendement incluant les dividendes réinvestis **afin de** comparer honnêtement une action qui verse des dividendes à une autre..

Critères d’acceptation :
- [ ] Les dividendes sont réinvestis au cours de l'ex-date, sans frais.
- [ ] Le résultat affiche le total des dividendes perçus et le rendement total.
- [ ] Les backtests antérieurs n'affichent pas de valeur inventée (champ null masqué).

Tâches : T-01, T-02, T-03, T-05, T-06, T-07 (détail dans `TASKS.md`).

---

#### US-03 · Garder un contrat de données compatible — MUST

**En tant que** développeur, **je veux** ajouter les nouveaux types de cours sans casser les résultats stockés **afin de** ne pas invalider les backtests déjà calculés..

Critères d’acceptation :
- [ ] Le type `CLOSE_SPLIT_ADJUSTED` reste valide en lecture.
- [ ] Producteur (engine) et consommateur (core-backend) changent dans le même diff.

Tâches : T-01 (détail dans `TASKS.md`).

---

### Lot 2 — Données

### Lot 3 — Moteur

#### US-02 · Mesurer l'effet du change sur un actif étranger — SHOULD

**En tant que** utilisateur, **je veux** voir la part de la performance due à la variation EUR/USD **afin de** comprendre qu'une action US peut gagner en cours et perdre en euros..

Critères d’acceptation :
- [ ] La contribution du change est affichée à côté du rendement en devise locale.
- [ ] La somme rendement local + contribution = rendement en EUR, à 0,1 point près.

Tâches : T-04, T-05, T-06 (détail dans `TASKS.md`).

---

### Lot 4 — Écrans

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Voir le rendement réel de mon investissement | MUST | 1 | contracts, backtest-engine, core-backend, web, docs |
| US-02 | Mesurer l'effet du change sur un actif étranger | SHOULD | 3 | backtest-engine, core-backend, web |
| US-03 | Garder un contrat de données compatible | MUST | 1 | contracts |
