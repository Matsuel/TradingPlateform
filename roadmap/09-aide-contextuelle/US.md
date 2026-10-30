# 09 · Aide contextuelle sur les données — User stories

> Source : demande utilisateur du 2026-10-30 (« je me perds » dans les données du résultat d’un backtest), hors « Roadmap annuelle ». Objectif pédagogique n° 1 du `README.md` : « implémenter **et expliquer** les concepts de gestion de portefeuille ».
> Maquette Figma (fichier `Trading`) : `26 · Aide sur une donnée (sheet)`, section « Aide contextuelle (26) ».

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `web/components` | `StatCard` (`label`, `value`, `caption`, `delta`), `AppSheet` (`trigger`, `title`, `description`, `children`, panneau à droite), `Column<T>.header: ReactNode` dans `data-table`, `ui/tooltip`, `ui/popover`, icônes `lucide-react`. | Bouton d’aide (`InfoHint`) qui ouvre un panneau d’explication ; emplacement `info` dans `StatCard`. |
| `web/features/backtest` | `BacktestStats`, `BacktestResultStats`, `LumpSumComparisonStats` (`stats.tsx`), `BacktestAssumptions` (`assumptions.tsx`, composant local `Assumption`), `EquityChart`, `backtestColumns`, `tradeColumns`, `holdingColumns` (`column.tsx`). | Icône d’aide sur chaque donnée calculée. |
| `web/features/market` | `marketColumns` (prix, variation 24 h, volume 24 h, tendance), `SymbolDetail`, `PriceChart`. | Icône d’aide sur les colonnes et le graphique. |
| Textes | Formules documentées en JSDoc dans `backtest-engine/engine/backtest.utils.ts` (`createDrawdownTracker`, `annualizedReturn`, `annualizedVolatility`, `sharpeRatio`) et `backtest.engine.ts` (`dcaAdvantage`, `totalReturn`) ; unités dans `packages/contracts`. Aucun texte destiné à l’utilisateur. | Catalogue des explications en français, une entrée par donnée affichée. |
| `core-backend` | Stats de la liste (`completedRate`, `failedRate`) calculées dans `services/backtest.service.ts`. | Rien : aucune nouvelle valeur métier. |

## Hors périmètre

- Page « Glossaire » listant toutes les entrées : COULD, à reprendre si le catalogue grossit (mois 6, Risk Engine).
- Visite guidée / onboarding pas à pas.
- Aide des écrans pas encore implémentés (comparaison, risque, projection, optimisation) : chaque feature ajoute ses entrées elle-même (règle de T-09).
- Exemple chiffré calculé côté web à partir des données de l’utilisateur (interdit par la règle « Responsabilités »).

## Décisions à valider

| # | Sujet | Proposition | Raison |
| --- | --- | --- | --- |
| D1 | Source des textes | Catalogue statique côté web, `apps/web/src/constants/glossary.ts` (transverse : marché et backtest), une entrée par clé stable (`totalReturn`, `maxDrawdown`…). Chaque entrée cite le symbole qui calcule la donnée (`annualizedReturn` de `backtest.utils.ts`) pour la relecture. | Un texte d’aide est de l’affichage, pas une valeur métier ; un seul client. L’API n’a rien à exposer. |
| D2 | Forme du panneau | Panneau latéral droit (`AppSheet`), pas une infobulle. | Formule, unité et exemple ne tiennent pas dans une infobulle ; une infobulle n’est pas utilisable au doigt. |
| D3 | Contenu d’une entrée | `title`, `purpose` (« À quoi ça sert »), `computation` (« Comment c’est calculé », en phrases), `formula` optionnelle (texte Unicode), `unit`, `readingTip` optionnel (« Comment le lire »), `source` (fichier et symbole). | Répond aux deux questions de la demande : à quoi ça sert, comment c’est calculé. |
| D4 | Valeur dans le panneau | Le panneau peut afficher la valeur **déjà formatée** par l’écran (`value?: ReactNode`), jamais recalculée. | Relie l’explication au chiffre lu, sans calcul côté web. |
| D5 | Formules | Texte Unicode en `font-mono` (`(Vf / V0)^(365,25 / j) − 1`), sans bibliothèque de rendu mathématique. | Aucune dépendance pour une poignée de formules. |
| D6 | Périmètre des icônes | Seulement les données **calculées ou interprétées** (rendement, drawdown, frais, taux, variation, volume, empreinte…), pas les champs bruts évidents (nom, date, symbole, statut). | Une icône partout devient du bruit visuel. |
| D7 | Icône | `Info` de `lucide-react`, 14 px, `text-muted-foreground`, à droite du libellé ; bouton focusable avec `aria-label` « À propos de <titre> ». | Repère standard, accessible au clavier. |

---

## User stories

### Lot 1 — Socle

#### US-01 · Comprendre une donnée affichée — MUST

**En tant qu’** utilisateur, **je veux** cliquer sur une icône à côté d’une donnée **afin de** lire à quoi elle sert et comment elle est calculée, sans quitter l’écran.

Critères d’acceptation :
- [ ] Une icône d’aide figure à côté de chaque donnée calculée du résultat d’un backtest, de la liste des backtests et du marché (D6).
- [ ] Le clic (ou `Entrée` au clavier) ouvre un panneau à droite : titre, « À quoi ça sert », « Comment c’est calculé », formule éventuelle, unité, « Comment le lire » éventuel, valeur affichée à l’écran (D4).
- [ ] Le panneau se ferme par `Échap`, la croix ou un clic hors du panneau ; le focus revient sur l’icône.
- [ ] Chaque explication est cohérente avec le code qui calcule la donnée (relecture contre le symbole cité en `source`).
- [ ] Le web ne calcule rien de nouveau : seuls des textes et un composant d’affichage sont ajoutés.

Tâches : T-01, T-02, T-03, T-04, T-05, T-06.

### Lot 2 — Formulaire

#### US-02 · Comprendre un paramètre avant de lancer un backtest — SHOULD

**En tant qu’** utilisateur, **je veux** la même aide sur les champs du formulaire « Nouveau backtest » **afin de** choisir le mode d’investissement, les frais et le rebalancement en connaissant leur effet.

Critères d’acceptation :
- [ ] Icône d’aide sur « Mode d’investissement », « Frais par ordre (%) », « Actifs et poids » et « Rebalancement » (dès que le champ existe, 08 T-12).

Tâches : T-07.

### Lot 3 — Suivi

#### US-03 · Les nouvelles métriques arrivent avec leur explication — MUST

**En tant qu’** utilisateur, **je veux** que chaque nouvelle métrique (CAGR, volatilité, Sharpe, récupération, benchmark) ait son aide dès son apparition **afin de** ne jamais lire un chiffre inexpliqué.

Critères d’acceptation :
- [ ] Les métriques de la feature 08 ont leur entrée de glossaire et leur icône.
- [ ] La règle « toute donnée calculée affichée a son entrée de glossaire » est écrite dans `apps/web/AGENTS.md`.

Tâches : T-08, T-09.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Comprendre une donnée affichée | MUST | 1 | web |
| US-02 | Comprendre un paramètre avant de lancer un backtest | SHOULD | 2 | web |
| US-03 | Les nouvelles métriques arrivent avec leur explication | MUST | 3 | web, docs |
