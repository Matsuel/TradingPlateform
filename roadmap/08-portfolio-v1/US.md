# 08 · Portfolio Management V1 — User stories

> Roadmap (`README.md`, « Roadmap annuelle ») : **poids par actif, rebalancement, benchmark, CAGR, volatilité, durée de récupération et Sharpe.**
> Maquettes Figma (fichier `Trading`) : `12.1 · Nouveau backtest · Allocation`, `13 · Résultats d’un backtest`, `19 · Comparaison de portefeuilles` (cartes KPI et tableau « Métriques comparées »), `11 · Liste des backtests` : références antérieures à la règle « Maquette d'abord » (`apps/web/AGENTS.md`), à revalider avant de coder un écran qui n'est pas encore implémenté. `13 v2 · A · Héros + blocs groupés` (`350:7214`) : détail d'un backtest, validée le 31/10/2026 ; `13 v2 · B` (`350:7651`) et `13 v2 · C` (`350:8088`) : écartées. `19 v2 · Comparaison de backtests` (`360:7783`) : page Comparaison (T-27), validée le 31/10/2026.

## Point de départ (fin du mois 3)

| Couche | Existant | Manque pour le mois 4 |
| --- | --- | --- |
| `backtest-engine/engine` | Portefeuille **équipondéré**, achats uniquement, DCA / investissement unique, frais, drawdown hors versements (TWR), comparaison DCA / investissement unique, provenance des données. | Poids cibles, ventes, rebalancement, benchmark, CAGR, volatilité, Sharpe, durée de récupération, courbe de drawdown. |
| `packages/contracts` | `backtest.requested` porte `symbols[]` ; `trade` sans sens (achat implicite). | `allocations` (symbole + poids), fréquence de rebalancement, benchmark, sens des ordres, nouvelles métriques. |
| `core-backend` | `Backtest.symbols String[]`, entrée API `strategy` + `amount` unique. | Allocation persistée, capital initial + versement séparés, rebalancement, benchmark, colonnes de métriques. |
| `web` | Formulaire « Stratégie / Symboles / Montant », résultat avec 4 cartes, courbe de valeur, hypothèses. | Formulaire d’allocation (maquette 12.1), cartes CAGR / volatilité / drawdown / Sharpe vs benchmark, courbe de drawdown, tableau de métriques, comparaison A/B. |

## Plan de développement

Ordre imposé par les dépendances : l’engine d’abord (pur et testé), puis contrat → base → API, puis l’affichage. Chaque lot se termine dans un état stable et démontrable.

| Lot | Semaine | Contenu | US | Démo de fin de lot |
| --- | --- | --- | --- | --- |
| **1. Allocation** | S1 | Poids cibles de bout en bout (engine → contrat → base → API → formulaire). | US-01, US-02 | Un backtest 60/40 `AAPL`/`IEF` se lance depuis le formulaire et respecte les poids au premier achat. |
| **2. Rebalancement** | S1–S2 | Ventes, frais sur ventes, rebalancement périodique, sens des ordres. | US-03, US-04 | Les ordres du backtest montrent des ventes et achats aux dates de rebalancement. |
| **3. Métriques** | S2–S3 | CAGR, volatilité, Sharpe, durée de récupération, courbe de drawdown. | US-05, US-06, US-07 | Le résultat affiche les 5 métriques ; un résultat antérieur affiche `<Dash />`. |
| **4. Benchmark** | S3 | Benchmark rejoué avec les mêmes flux et frais, métriques et courbe. | US-08, US-09 | Les cartes KPI comparent la stratégie au MSCI World. |
| **5. Comparaison et finitions** | S4 | Comparaison de deux portefeuilles, liste enrichie, documentation, démo. | US-10, US-11, US-12 | Scénario de démo du README, étapes 1 à 3 (hors dates de départ). |

**Hors mois 4** (mois 5, maquette 19) : tableau « Selon la date de départ », rendements glissants, effet devise. Les blocs correspondants de la maquette 19 ne sont pas implémentés ce mois-ci.

## Décisions à valider avant de coder

Ces choix structurent le contrat et la base. Ils sont proposés par défaut ; à confirmer ou corriger avant le lot 1.

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Stockage de l’allocation | Table `BacktestAllocation` (`backtestId`, `symbol`, `weight Decimal(3,2)`, ratio au pourcent près), unique `(backtestId, symbol)`. Migration : backfill équipondéré au pourcent entier depuis `symbols` (le reste de 100 réparti sur les premiers symboles), puis suppression de `Backtest.symbols`. **Validée.** | Une seule source pour les actifs (règle « une signification, un seul endroit ») ; Prisma sait filtrer et inclure une relation. |
| D2 | Poids | Saisie et API au **pourcent entier** (1 à 100, somme = 100 exactement). Contrat et base en ratio (`0.6`), multiple de `0.01` : somme = 1 à `1e-6` près (tolérance flottante), chaque poids dans `]0, 1]`, symboles uniques. Validé par zod côté API **et** dans le contrat. **Validée (amendée : précision au pourcent).** | Convention des ratios du dépôt ; une précision plus fine n’apporte rien à l’utilisateur et complique la saisie. |
| D3 | Rendement annualisé | CAGR calculé sur la performance pondérée dans le temps (TWR, hors versements), comme le drawdown actuel. **Validée.** | Comparable entre DCA, investissement unique et benchmark ; le rendement total actuel (profit / versé) reste affiché. |
| D4 | Volatilité | Écart-type des rendements journaliers TWR × √252, annualisé. **Validée.** | Standard ; 252 jours de cotation par an en constante nommée de l’engine. |
| D5 | Sharpe | (rendement annualisé − taux sans risque) / volatilité, avec **taux sans risque fixé à 0** en constante de l’engine et affiché dans les hypothèses. `null` si volatilité nulle. **Validée.** | Pas de série de taux disponible ; une constante visible vaut mieux qu’un paramètre non justifié. |
| D6 | Durée de récupération | Jours calendaires entre le plus-haut précédant le max drawdown et le premier retour à ce plus-haut. `maxDrawdownRecoveryDate: null` = pas encore récupéré. **Validée.** | Question du README : « combien de temps pour retrouver le précédent plus-haut ». |
| D7 | Rebalancement | Fréquence `NONE` / `MONTHLY` / `QUARTERLY` / `YEARLY`, au premier jour de cotation de la période, à la clôture (décision planifiée : règle `CLOSE_ON_SCHEDULED_DAY` inchangée). Ordre du jour : versement d’abord (réparti selon les poids cibles), puis rebalancement. **Validée.** | Pas de look-ahead : la date est connue à l’avance. |
| D8 | Frais | Le taux s’applique à **chaque ordre**, achat ou vente (`feeRate` : « frais par ordre »). **Validée.** | Le rebalancement introduit des ventes ; ignorer leurs frais surestimerait le résultat. |
| D9 | Benchmark | Un symbole optionnel (`benchmarkSymbol`), rejoué avec **les mêmes versements, dates et frais**, 100 % sur le benchmark. Suggestion par défaut dans le formulaire : `URTH` (MSCI World). **Validée.** | Comparaison à capital et flux identiques, seule l’allocation change. |
| D10 | Résultats antérieurs | Nouvelles colonnes nullables ; `cagr === null` signale un résultat antérieur au mois 4 : le web affiche `<Dash />` sans recalcul. Les `trades` sans `side` sont lus comme des achats. **Validée.** | Règle « Résultats stockés qui évoluent ». |

---

## User stories

Priorités : **MUST** (roadmap du mois 4), **SHOULD** (maquette, à faire si le MUST est terminé).
Chaque US touche toutes les couches concernées dans le même diff et met à jour `API.md` / `COMPONENTS.md` si une route ou un composant catalogué change.

### Lot 1 — Allocation

#### US-01 · Simuler un portefeuille avec des poids cibles — MUST

**En tant qu’** utilisateur, **je veux** attribuer un poids à chaque actif **afin de** simuler une allocation précise (ex. 60 % actions / 40 % obligations) plutôt qu’un panier équipondéré.

Critères d’acceptation :
- [x] Chaque versement est réparti entre les actifs selon leurs poids cibles, frais déduits de chaque ordre.
- [x] Un panier aux poids égaux exactement représentables au pourcent (ex. 50/50, 25×4) donne exactement le résultat actuel : test de non-régression sur la fixture existante. Un panier de 3 actifs passe de 1/3 à 34/33/33 (D2) : seul un « Relancer » diffère légèrement, les résultats stockés ne changent pas.
- [x] Les poids invalides (somme ≠ 1, poids ≤ 0, symbole dupliqué) sont rejetés par le contrat ; le consumer de l’engine loggue et ignore le message.
- [x] Même entrée + mêmes cours ⇒ même résultat (test de reproductibilité étendu aux poids).

Tâches :
- `packages/contracts` : remplacer `symbols` par `allocations: [{ symbol, weight }]` (unité : ratio) dans `backtestRequestedPayloadSchema`, avec le `refine` de somme.
- `backtest-engine/engine` : `simulate` lit les poids ; tests unitaires (répartition 60/40, arrondis, cours manquant reporté).
- `backtest-engine/services` + `repositories` : récupérer les cours des symboles de `allocations`.
- `core-backend` : migration D1 (table, backfill, suppression de `symbols`), repository (`include` de l’allocation), service (mapping allocation → payload).

#### US-02 · Composer l’allocation dans le formulaire — MUST

**En tant qu’** utilisateur, **je veux** composer mon portefeuille dans le formulaire « Nouveau backtest » **afin de** saisir actifs, poids, capital initial et versement mensuel au même endroit (maquette `12.1`).

Critères d’acceptation :
- [x] Section « Allocation et période » : liste « Actifs et poids » avec, par ligne, symbole + nom, barre proportionnelle et champ `%` ; bouton « + Ajouter un actif » qui ouvre la recherche de symboles existante ; suppression d’une ligne.
- [x] Badge « Total » vert à 100 %, rouge sinon ; le bouton « Lancer le backtest » est désactivé tant que le total ≠ 100 %.
- [x] Section « Général » : « Mode d’investissement » (`Investissement unique` / `Investissement unique + versements mensuels`), « Versement mensuel (€) » visible seulement en DCA ; « Capital initial (€) » dans « Allocation et période », avec Début, Fin et « Frais par ordre (%) ».
- [x] L’API `POST /api/backtests` accepte `allocations` (poids en pourcent entier côté formulaire, convertis en ratio par le schéma d’entrée du backend), `initialAmount`, `recurringAmount` ; erreurs zod renvoyées en 400 et affichées sous le champ. Livrée sous le préfixe existant `POST /api/backtest` (singulier).
- [x] « Relancer » réutilise l’allocation persistée.

Tâches :
- `core-backend/interfaces` : nouveau `createBacktestSchema` (allocations, capital initial, versement, fréquence), mapping dans le service ; `API.md` mis à jour.
- `web/features/backtest` : champ d’allocation (composant de formulaire, à cataloguer dans `COMPONENTS.md`), `schema.ts`, `sections.tsx`.
- Le panneau « Récapitulatif » de la maquette (nombre de rebalancements et versements prévus) est **SHOULD** : ces nombres sont des valeurs métier, donc calculés par le backend (endpoint de prévisualisation) et pas par le web. À reporter si le temps manque.

### Lot 2 — Rebalancement

#### US-03 · Rebalancer périodiquement — MUST

**En tant qu’** utilisateur, **je veux** choisir une fréquence de rebalancement **afin de** ramener le portefeuille à ses poids cibles et éviter que l’allocation ne dérive.

Critères d’acceptation :
- [x] Champ « Rebalancement » (Aucun / Mensuel / Trimestriel / Annuel, aide « Ramène les poids à la cible ») dans le formulaire.
- [x] Aux dates de D7, l’engine vend les actifs surpondérés et achète les sous-pondérés ; après l’opération, chaque poids est égal à la cible (aux frais près).
- [x] Frais appliqués aux ventes comme aux achats (D8) et inclus dans `totalFees`.
- [x] `NONE` reproduit le comportement actuel (aucune vente).
- [x] Tests : dérive puis retour à la cible sur une fixture à deux actifs aux trajectoires opposées ; pas de rebalancement le premier jour ; aucune vente sans rebalancement.

Tâches :
- Contrat : `rebalanceFrequency` dans `backtest.requested`.
- Engine : étape de rebalancement, réutilise `periodKey` de `backtest.utils.ts`.
- Base : `Backtest.rebalanceFrequency` (enum, `@default(NONE)` pour les lignes existantes).
- Hypothèses affichées : ligne « Rebalancement » dans `assumptions.tsx`.

#### US-04 · Distinguer achats et ventes dans les ordres simulés — MUST

**En tant qu’** utilisateur, **je veux** voir le sens de chaque ordre **afin de** comprendre ce que le rebalancement a exécuté.

Critères d’acceptation :
- [x] `trade.side` (`BUY` / `SELL`) dans le contrat ; quantité et montant restent positifs, le sens porte le signe.
- [x] Tableau des ordres : colonne « Côté » avec badges « Achat » / « Vente » (maquette `13`).
- [x] Un ordre d’un résultat antérieur sans `side` s’affiche « Achat » (D10).
- [x] `holdings` reflète les quantités après ventes.

### Lot 3 — Métriques

#### US-05 · Mesurer rendement annualisé, volatilité et Sharpe — MUST

**En tant qu’** utilisateur, **je veux** connaître le CAGR, la volatilité et le Sharpe de ma stratégie **afin de** juger le rendement obtenu au regard du risque pris.

Critères d’acceptation :
- [x] L’engine calcule `cagr`, `volatility` et `sharpeRatio` selon D3, D4, D5 ; unités documentées dans le contrat (ratios annualisés, Sharpe sans unité).
- [x] Tests unitaires contre des valeurs calculées à la main : série constante (volatilité 0, Sharpe `null`), série à rendement journalier fixe (CAGR connu), période inférieure à un an.
- [x] Colonnes nullables dans `BacktestResult` (`Decimal(12,6)`), écrites dans la transaction de complétion existante.
- [x] Le taux sans risque utilisé (0 %) apparaît dans les hypothèses.

#### US-06 · Mesurer la durée de récupération — MUST

**En tant qu’** utilisateur, **je veux** savoir combien de temps le portefeuille a mis à retrouver son plus-haut après la pire baisse **afin de** mesurer la douleur réelle d’un drawdown.

Critères d’acceptation :
- [x] L’engine publie `maxDrawdownPeakDate`, `maxDrawdownRecoveryDate` (`null` si non récupéré) et `recoveryDays` (jours calendaires, `null` si non récupéré) selon D6, en étendant `createDrawdownTracker`.
- [x] Tests : baisse récupérée, baisse jamais récupérée, aucune baisse (`maxDrawdown` 0).
- [x] Affichage « 14 mois » / « 45 jours » (formatage d’une durée côté web) ; « Non récupéré » si `null` avec une date de plus-haut présente ; `<Dash />` pour un résultat antérieur.

#### US-07 · Afficher les métriques et la courbe de drawdown — MUST

**En tant qu’** utilisateur, **je veux** retrouver toutes les métriques sur la page de résultat **afin de** lire la performance et le risque d’un coup d’œil.

Critères d’acceptation :
- [x] ~~Cartes KPI (style maquette `19`)~~ : amendé par la refonte du détail (maquette « 13 v2 · A », `350:7214`) : CAGR, volatilité, Sharpe, max drawdown (date, récupération), valeur finale et frais dans les blocs Performance, Risque et Coûts (`BacktestResultBlocks`, T-25).
- [x] Courbe de drawdown sous la courbe de valeur : `equityPoint.drawdown` (ratio ≤ 0, TWR) calculé par l’engine, absent des résultats antérieurs (le graphique est alors masqué).
- [x] Vérifier la taille du message `backtest.completed` sur une période de 20 ans (le champ ajouté par point ne doit pas dépasser la limite du broker, cf. gzip).
- [x] Ratios affichés en pourcentage via `lib/format.ts`, aucun calcul dans le composant.

### Lot 4 — Benchmark

#### US-08 · Comparer la stratégie à un benchmark — MUST

**En tant qu’** utilisateur, **je veux** choisir un indice de référence **afin de** savoir si mon allocation a fait mieux ou moins bien qu’un placement passif.

Critères d’acceptation :
- [x] Champ « Benchmark » dans le formulaire (recherche de symboles, défaut suggéré `URTH`) ; optionnel.
- [x] L’engine rejoue le benchmark selon D9 et publie `benchmark: { symbol, finalValue, totalReturn, cagr, volatility, sharpeRatio, maxDrawdown, recoveryDays } | null` et `benchmarkValue` sur chaque point de courbe.
- [x] Données du benchmark incluses dans l’empreinte `dataSource.fingerprint`.
- [x] Benchmark sans données sur la période → exécution en échec avec un message explicite (« Données indisponibles pour URTH »). Message livré : « No market data for URTH » (`BacktestError`, T-22).
- [x] Tests : benchmark identique à l’unique actif du portefeuille ⇒ mêmes métriques.

Tâches :
- Base : `Backtest.benchmarkSymbol String?`, `BacktestResult.benchmark Json?` (omis des listes comme `lumpSumComparison`).

#### US-09 · Lire l’écart au benchmark — MUST

**En tant qu’** utilisateur, **je veux** voir l’écart entre ma stratégie et le benchmark sur chaque métrique **afin de** interpréter le résultat sans calcul mental.

Critères d’acceptation :
- [ ] ~~Badges d’écart sur les cartes KPI~~ : retiré par la refonte du détail (plus de cartes KPI). Les écarts `benchmark.excess*` sont publiés et stockés mais affichés nulle part : la page Comparaison montre les écarts A − B, pas l’écart au benchmark (dette).
- [x] Les écarts (CAGR, volatilité, drawdown, Sharpe) sont calculés par l’engine et publiés dans `benchmark` (ex. `excessCagr`) : deux clients doivent montrer le même chiffre.
- [x] Courbe de valeur : série « Benchmark » superposée, légende.
- [x] Tableau « Métriques comparées » : lignes Rendement annualisé, Volatilité, Max drawdown, Durée de récupération, Sharpe ; colonnes Portefeuille / Benchmark.
- [x] Sans benchmark : badges et colonne masqués.

### Lot 5 — Comparaison et finitions

#### US-10 · Comparer deux portefeuilles — SHOULD

**En tant qu’** utilisateur, **je veux** comparer deux backtests terminés côte à côte **afin de** comprendre le compromis rendement / risque entre deux allocations (README, « Comparaison de portefeuilles »).

Critères d’acceptation :
- [x] Page `Analyse > Comparaison` (maquette « 19 v2 », `360:7783`, validée le 31/10/2026) : sélection de deux backtests de l’utilisateur ayant un résultat terminé, courbe « Valeur des portefeuilles » (A, B, benchmark), tableau « Métriques comparées » avec colonne « Écart » A − B (remplace les cartes KPI de la maquette `19`), carte « Paramètres ». Responsive vérifié par l’utilisateur le 31/10/2026.
- [x] Route `GET /api/backtests/compare?ids=a,b` : lit les derniers résultats terminés, `NotFoundError` si un backtest n’appartient pas à l’utilisateur, `BadRequestError` si un backtest n’a pas de résultat terminé. Les écarts A − B sont calculés par le service. Livrée en `GET /api/backtest/compare` (T-26).
- [x] Bandeau d’avertissement si les périodes, frais ou benchmarks diffèrent (comparaison non homogène), signalé par le backend.
- [x] Entrée dans `API.md`.

#### US-11 · Lire l’allocation et le CAGR dans la liste — SHOULD

**En tant qu’** utilisateur, **je veux** voir l’allocation et le rendement annualisé dans la liste des backtests **afin de** retrouver un portefeuille sans l’ouvrir.

Critères d’acceptation :
- [x] Colonne « Allocation » (ex. `AAPL 30 % · MSFT 30 % · IEF 40 %`, tronquée) et colonne « CAGR » (`<Dash />` pour un résultat antérieur ou non terminé).
- [x] La liste n’inclut pas les colonnes lourdes (`equityCurve`, `trades`, `benchmark`) : règle « lecture légère » du repository.

#### US-12 · Documenter et préparer la démo du mois 4 — MUST

**En tant qu’** évaluateur, **je veux** un scénario reproductible et des limites explicites **afin de** vérifier que le Portfolio Management V1 est terminé.

Critères d’acceptation :
- [x] README : « Définition de terminé », case « Un portefeuille multi-actifs avec poids et rebalancement affiche CAGR, volatilité, max drawdown, durée de récupération, Sharpe et benchmark » cochée ; limites ajoutées (taux sans risque à 0, dividendes non inclus, actifs cotés en USD affichés en EUR sans conversion jusqu’au mois 5).
- [x] Scénario : 60 % `AAPL` / 40 % `MSFT`, rebalancement annuel, frais 0,1 %, benchmark `URTH`, statut `PENDING` → `RUNNING` → `COMPLETED`, métriques face au benchmark.
- [x] `bunx tsc --noEmit` dans chaque app/package touché, `bun test` dans `apps/backtest-engine`, `bun run lint` dans `apps/web`.
- [x] Services redémarrés après chaque changement de contrat (engine et core-backend). Vérifié indirectement : démo T-30 sur les services à jour (code identique au dépôt).

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Poids cibles | MUST | 1 | contracts, engine, core-backend |
| US-02 | Formulaire d’allocation | MUST | 1 | core-backend, web |
| US-03 | Rebalancement périodique | MUST | 2 | contracts, engine, core-backend, web |
| US-04 | Achats et ventes | MUST | 2 | contracts, engine, web |
| US-05 | CAGR, volatilité, Sharpe | MUST | 3 | contracts, engine, core-backend |
| US-06 | Durée de récupération | MUST | 3 | contracts, engine, core-backend, web |
| US-07 | Affichage des métriques et drawdown | MUST | 3 | engine, web |
| US-08 | Benchmark | MUST | 4 | contracts, engine, core-backend, web |
| US-09 | Écart au benchmark | MUST | 4 | engine, web |
| US-10 | Comparaison de deux portefeuilles | SHOULD | 5 | core-backend, web |
| US-11 | Allocation et CAGR dans la liste | SHOULD | 5 | core-backend, web |
| US-12 | Documentation et démo | MUST | 5 | README |
