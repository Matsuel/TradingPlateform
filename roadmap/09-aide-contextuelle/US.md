# 09 · Aide contextuelle sur les données — User stories

> Source : demande utilisateur du 2026-10-30 (« je me perds » dans les données du résultat d’un backtest), hors « Roadmap annuelle ». Objectif pédagogique n° 1 du `README.md` : « implémenter **et expliquer** les concepts de gestion de portefeuille ».
> Maquettes Figma (fichier `Trading`, section « Feature 09 · Aide contextuelle (15) ») : `15 · Aide sur une donnée (sheet)` (`341:6986`), validée le 01/11/2026 ; `15.1 · Déclencheur de l’aide · libellés soulignés` (`391:9918`), validée le 01/11/2026.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `web/components` | `StatCard` (`label: string`, `value`, `caption`, `delta`), `AppSheet` (`trigger`, `title`, `description`, `children`, panneau à droite), `Column<T>.header: ReactNode` dans `data-table`. | Déclencheur `InfoHint` (libellé souligné qui ouvre le panneau) ; libellé `ReactNode` dans `StatCard`. |
| `web/features/backtest` | `ResultOverview` (valeur finale, courbes de valeur et de drawdown), `BacktestResultBlocks` sur `MetricBlock` (`MetricRow.label: string`), `BacktestAssumptions` (`Assumption`), `tradeColumns`, `holdingColumns`, `backtestColumns`, `BacktestStats`, comparaison (`ComparisonMetrics`, `ComparisonParameters` dans `comparison-blocks.tsx`). | Libellé cliquable sur chaque donnée calculée ; libellé `ReactNode` dans `MetricRow`. |
| `web/features/market` | `marketColumns` (prix, variation 24 h, volume 24 h, tendance), `PriceChart`. | Libellé cliquable sur les colonnes et le graphique. |
| Textes | Formules documentées en JSDoc dans `backtest-engine/engine/backtest.utils.ts` (`createDrawdownTracker`, `annualizedReturn`, `annualizedVolatility`, `sharpeRatio`) et `backtest.engine.ts` ; unités dans `packages/contracts`. Aucun texte destiné à l’utilisateur. | Catalogue des explications en français, une entrée par donnée affichée. |
| `core-backend` | Stats de la liste (`completedRate`, `failedRate`) et écarts de la comparaison (`deltas`) calculés dans `services/`. | Rien : aucune nouvelle valeur métier. |

## Hors périmètre

- Page « Glossaire » listant toutes les entrées : COULD, à reprendre si le catalogue grossit (mois 6, Risk Engine).
- Visite guidée / onboarding pas à pas.
- Aide des écrans pas encore implémentés (robustesse, risque, projection, optimisation) : chaque feature ajoute ses entrées elle-même (règle de T-09).
- Exemple chiffré calculé côté web à partir des données de l’utilisateur (interdit par la règle « Responsabilités »).

## Décisions

Validées le 01/11/2026.

| # | Sujet | Décision | Raison |
| --- | --- | --- | --- |
| D1 | Source des textes | Catalogue statique côté web, `apps/web/src/constants/glossary.ts` (transverse : marché et backtest), une entrée par clé stable (`totalReturn`, `maxDrawdown`…). Chaque entrée cite le symbole qui calcule la donnée (`annualizedReturn` de `backtest.utils.ts`) pour la relecture. | Un texte d’aide est de l’affichage, pas une valeur métier ; un seul client. L’API n’a rien à exposer. |
| D2 | Forme du panneau | Panneau latéral droit (`AppSheet`), pas une infobulle (maquette 15). | Formule, unité et exemple ne tiennent pas dans une infobulle ; une infobulle n’est pas utilisable au doigt. |
| D3 | Contenu d’une entrée | `title`, `purpose` (« À quoi ça sert »), `computation` (« Comment c’est calculé », en phrases), `formula` optionnelle (texte Unicode), `unit`, `readingTip` optionnel (« Comment le lire »), `source` (fichier et symbole). | Répond aux deux questions de la demande : à quoi ça sert, comment c’est calculé. |
| D4 | Valeur dans le panneau | Le panneau peut afficher la valeur **déjà formatée** par l’écran (`value?: ReactNode`), jamais recalculée. | Relie l’explication au chiffre lu, sans calcul côté web. |
| D5 | Formules | Texte Unicode en `font-mono` (`(Vf / V0)^(365,25 / j) − 1`), sans bibliothèque de rendu mathématique. | Aucune dépendance pour une poignée de formules. |
| D6 | Périmètre | Seulement les données **calculées ou interprétées** (rendement, drawdown, frais, taux, variation, volume, empreinte…), pas les champs bruts évidents (nom, date, symbole, statut). | Souligner tout l’écran deviendrait du bruit visuel. |
| D7 | Déclencheur | Le libellé lui-même, souligné en pointillés (`decoration-dotted`, couleur `muted-foreground`), `cursor-pointer` (`cursor-help` remplacé le 01/11/2026 à la demande de l’utilisateur), dans un `<button>` focusable avec `aria-haspopup="dialog"` ; pas d’icône (maquette 15.1). Écartés : ligne entière cliquable avec icône au survol (aide invisible, rien au doigt), interrupteur « Expliquer les chiffres » (aide cachée derrière un geste). | Repère connu (« ce mot a une définition »), visible sans survol, utilisable au doigt et au clavier, sans élément ajouté à côté du chiffre. |

---

## User stories

### Lot 1 — Socle et écrans

#### US-01 · Comprendre une donnée affichée — MUST

**En tant qu’** utilisateur, **je veux** cliquer sur le libellé d’une donnée **afin de** lire à quoi elle sert et comment elle est calculée, sans quitter l’écran.

Critères d’acceptation :
- [x] Le libellé de chaque donnée calculée du résultat d’un backtest, de la liste des backtests, de la comparaison et du marché est souligné en pointillés (D6, D7).
- [x] Le clic (ou `Entrée` au clavier) ouvre un panneau à droite : titre, « À quoi ça sert », « Comment c’est calculé », formule éventuelle, unité, « Comment le lire » éventuel, valeur affichée à l’écran (D4), source.
- [ ] Le panneau se ferme par `Échap`, la croix ou un clic hors du panneau ; le focus revient sur le libellé. — *Non coché : vérifié à la lecture du code, pas dans un navigateur.*
- [x] Chaque explication est cohérente avec le code qui calcule la donnée (relecture contre le symbole cité en `source`).
- [x] Le web ne calcule rien de nouveau : seuls des textes et un composant d’affichage sont ajoutés.

Tâches : T-01, T-02, T-03, T-04, T-05, T-06, T-07.

### Lot 2 — Formulaire

#### US-02 · Comprendre un paramètre avant de lancer un backtest — SHOULD

**En tant qu’** utilisateur, **je veux** la même aide sur les champs du formulaire « Nouveau backtest » **afin de** choisir le mode d’investissement, les frais et le rebalancement en connaissant leur effet.

Critères d’acceptation :
- [x] Libellé cliquable sur « Mode d’investissement », « Actifs et poids », « Frais par ordre (%) », « Rebalancement » et « Benchmark ».

Tâches : T-08.

### Lot 3 — Suivi

#### US-03 · Les nouvelles métriques arrivent avec leur explication — MUST

**En tant qu’** utilisateur, **je veux** que chaque nouvelle métrique ait son aide dès son apparition **afin de** ne jamais lire un chiffre inexpliqué.

Critères d’acceptation :
- [x] Les métriques de la feature 08 (CAGR, volatilité, Sharpe, récupération, benchmark, rebalancements) ont leur entrée de glossaire (T-01) et leur libellé cliquable.
- [x] La règle « toute donnée calculée affichée a son entrée de glossaire » est écrite dans `apps/web/AGENTS.md`.

Tâches : T-01, T-09.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Comprendre une donnée affichée | MUST | 1 | web |
| US-02 | Comprendre un paramètre avant de lancer un backtest | SHOULD | 2 | web |
| US-03 | Les nouvelles métriques arrivent avec leur explication | MUST | 3 | web, docs |
