# 09 · Aide contextuelle sur les données

- **Statut** : En cours
- **Roadmap** : hors « Roadmap annuelle », demande du 2026-10-30 ; à mener après la feature 08, avant le mois 5. Sert l’objectif pédagogique n° 1 (« implémenter et expliquer »).
- **Période** : 2026-11-01 →
- **Branche / PR** : `feat/aide-contextuelle` / à créer
- **Points** : 22 (MUST 20, SHOULD 2) — prévus
- **Maquettes** : `15 · Aide sur une donnée (sheet)` (`341:6986`) et `15.1 · Déclencheur de l’aide · libellés soulignés` (`391:9918`), validées le 01/11/2026

## Objectif

Le résultat d’un backtest, la liste, la comparaison et le marché alignent une vingtaine de chiffres calculés (CAGR, Sharpe, max drawdown, écart du DCA, empreinte des données…). L’utilisateur s’y perd. À la fin, le libellé de chaque donnée calculée est souligné en pointillés : un clic ouvre un panneau qui dit à quoi sert la donnée, comment elle est calculée, son unité et comment la lire.

## Comment

Front seul : aucune valeur métier nouvelle. Un catalogue de textes `constants/glossary.ts` (D1), un composant partagé `InfoHint` qui transforme un libellé en déclencheur souligné et ouvre `AppSheet` (D2, D7), un libellé `ReactNode` dans `MetricBlock` et `StatCard`, puis le branchement écran par écran (résultat, liste, comparaison, marché, formulaire). Chaque texte cite le symbole de l’engine ou du service qui calcule la donnée, pour rester vrai quand le calcul change ; la règle de maintenance entre dans `apps/web/AGENTS.md` (T-09).

## Décisions

D1 à D7 validées le 01/11/2026 : `US.md`, section « Décisions ». D7 change le déclencheur : libellé souligné en pointillés au lieu d’une icône (propositions « ligne cliquable » et « mode Expliquer » écartées).

## Écarts au plan

- 01/11/2026 : plan réécrit sur le code issu de la feature 08 (`BacktestResultBlocks`, `MetricBlock`, `ResultOverview` remplacent les cartes KPI) ; les entrées des métriques de la feature 08 rejoignent T-01 ; ajout de la page Comparaison (T-07).
- 01/11/2026, revue de code : `MetricRow` porte `hint` au lieu d’un libellé `ReactNode` (une seule mise en forme de l’aide, panneau rempli avec chaque colonne) ; `StatCard` reste `label: string`, l’aide des taux est sur la légende ; les champs de formulaire prennent `hint` (`AllocationField` réutilise son libellé texte en `aria-label`). La légende du graphique de résultat (maquette 15.1), absente du code, est ajoutée pour porter l’aide de la courbe de valeur, du benchmark ou de l’investissement unique et du drawdown. « Versements » n’existe pas dans le résultat (seulement `contributionCount` de la prévisualisation) : aide posée sur « Versements prévus » du récapitulatif ; l’ajouter au résultat demanderait un changement engine → contrat → base. Curseur `pointer` au lieu de `help` à la demande de l’utilisateur.
- 01/11/2026, constat hors périmètre : l’engine ne convertit aucun cours, un montant « en euros » est en réalité dans la devise de cotation des actifs. Les textes du glossaire le disent ; la correction (conversion de change) relève du backend.

## Bilan

À remplir à la clôture (skill `feature-roadmap`, mode clôture).

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
