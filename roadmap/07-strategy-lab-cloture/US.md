# 07 · Clôture du Strategy Lab — User stories

> Sources : README, « Roadmap annuelle », mois 3, et « Principes de validité des backtests » ; maquette `13` ; commits du 2026-10-29 au 2026-10-30 (rétro).

## Hors périmètre

- Poids, rebalancement, benchmark et métriques de risque : feature 08.
- Dividendes et splits au-delà des clôtures ajustées (mois 10).

---

## User stories

### Lot 1 — Résultat complet

#### US-01 · Voir le total des frais — MUST

**En tant qu’** utilisateur, **je veux** connaître la somme des frais payés **afin de** mesurer leur poids dans le résultat.

Critères d’acceptation :
- [x] `totalFees` calculé par l’engine (somme des frais de chaque achat), stocké et affiché en carte.

Tâches : T-02.

#### US-02 · Voir les quantités achetées et les positions finales — MUST

**En tant qu’** utilisateur, **je veux** voir chaque achat avec sa quantité et ce que je détiens à la fin **afin de** comprendre comment la valeur s’est construite.

Critères d’acceptation :
- [x] Chaque achat porte cours, quantité, montant et frais.
- [x] Positions finales valorisées au dernier cours.
- [x] Tableaux « Ordres » et « Positions finales ».

Tâches : T-03.

#### US-03 · Comparer le DCA à un investissement unique — MUST

**En tant qu’** utilisateur hésitant, **je veux** savoir si investir progressivement a fait mieux que tout investir le premier jour **afin de** choisir ma méthode en connaissance de cause.

Critères d’acceptation :
- [x] Même total versé, même période, mêmes frais, en un achat au premier jour.
- [x] Valeur finale, rendement, drawdown et avantage du DCA ; courbe en pointillés.
- [x] Pas de comparaison pour un investissement unique.
- [x] Message `backtest.completed` sous la limite du broker sur un historique long.

Tâches : T-04, T-05.

### Lot 2 — Explicabilité et reproductibilité

#### US-04 · Voir les hypothèses de la simulation — MUST

**En tant qu’** utilisateur, **je veux** voir la période, la devise, les frais, la règle d’exécution et la source des données **afin de** savoir sur quoi repose le résultat.

Critères d’acceptation :
- [x] Carte « Hypothèses » : période, devise, frais, règle d’exécution, fournisseur, type de cours, date de récupération, empreinte, avertissement.
- [x] Résultat antérieur sans ces champs affiché avec `<Dash />`.

Tâches : T-01, T-07.

#### US-05 · Obtenir des résultats reproductibles — MUST

**En tant qu’** évaluateur, **je veux** la preuve que les mêmes entrées donnent le même résultat **afin de** faire confiance au moteur.

Critères d’acceptation :
- [x] Jeu de données de référence déterministe, métriques figées dans les tests.
- [x] Tests de déterminisme, d’immutabilité des entrées et de stabilité de l’empreinte.
- [x] Helpers de calcul extraits et testés (`backtest.utils.ts`).

Tâches : T-06, T-07.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Total des frais | MUST | 1 | contracts, engine, core-backend, web |
| US-02 | Quantités et positions | MUST | 1 | contracts, engine, core-backend, web |
| US-03 | DCA vs investissement unique | MUST | 1 | contracts, engine, core-backend, web, kafka |
| US-04 | Hypothèses | MUST | 2 | README, contracts, engine, core-backend, web |
| US-05 | Reproductibilité | MUST | 2 | engine |
