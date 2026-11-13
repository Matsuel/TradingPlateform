# 13 · Risk Engine

- **Statut** : Planifiée
- **Roadmap** : Mois 6 — Mois 6 — Risk Engine (corrélations, VaR / CVaR, contribution au risque, contraintes)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/risk-engine` — PR à ouvrir
- **Points** : 37 (MUST 24, SHOULD 13) — prévus (25 avant l'affinage du 2026-11-13)
- **Maquettes** : `33 · Risque` (créée, node `454:12126`), décrite dans [`MAQUETTE.md`](MAQUETTE.md)
- **Écrans modifiés** : `13 · Résultat d’un backtest` (node `350:7214`) : bouton « Risque » vers `/app/risk?backtest=<id>` (décision : pas de bloc dans le résultat) — dessiné dans la copie `à modifier (F13)` ; l’original est mis à jour au codage
- **Dépend de** : 11 (rendements corrects). Gèle le moteur de simulation à la fin de cette feature.

## Objectif

L'utilisateur voit où vient le risque de son portefeuille : corrélations, perte d'un mauvais jour, part de chaque actif, et si une contrainte est respectée. Cette feature a l'objectif pédagogique 1 du README (volatilité, corrélation).

## Comment

Fonctions pures dans `backtest-engine/engine/risk.ts`, calculées à chaque backtest sur les rendements journaliers des actifs en EUR pondérés aux poids cibles, publiées dans l'événement `backtest.completed` (schéma de `contracts`) et stockées avec le résultat. `core-backend` stocke le seuil de drawdown et évalue la contrainte à partir du drawdown maximal déjà calculé, sans relancer l'engine ; le web affiche. Le moteur de simulation est gelé à la fin (roadmap mois 6).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **VaR et CVaR** : historiques, 95 %, un jour, **en % seulement** | Méthode la plus simple à expliquer et à tester ; la maquette 33 n'affiche aucun montant en euros. | PO, 2026-11-13 |
| D2 | **Expositions** : par actif seulement | Secteur et zone exigent les données `assetProfile` de Yahoo, non appelées aujourd'hui : reportées (note de la maquette : « non disponibles dans cette version »). | PO, 2026-11-13 |
| D3 | **Contraintes** : drawdown maximal seulement en MVP | Évite un moteur de règles ; les autres contraintes sont hors périmètre. | PO, 2026-11-13 |
| D4 | **Base du calcul** : rendements journaliers des actifs, pondérés aux **poids cibles constants** | Corrélation et contribution à la variance sont une valeur unique par actif, testable sur un jeu à résultat connu. Versements (DCA) et rebalancement n'influencent pas le risque affiché ; la page le dit. | PO, 2026-11-13 |
| D5 | **Devise** : EUR, effet de change inclus | Cohérent avec le rendement total de la feature 11. | PO, 2026-11-13 |
| D6 | **Historique minimal** : 250 jours de cotation communs à tous les actifs, sinon « données insuffisantes » (aucun résultat de risque) | Une VaR à 95 % sur moins d'un an n'a pas de sens. Un actif sans cours sur la période commune réduit l'intersection ; sous 250 jours le risque est absent (proposé, à valider avec le cas limite). | PO (250 jours) ; cas limite proposé |
| D7 | **Concentration** : indice de Herfindahl sur les **poids** (`HHI`), actifs effectifs = 1 / HHI | La maquette l'impose : HHI 0,28 pour 30/30/30/10 (3 × 0,09 + 0,01), « 3,6 actifs effectifs », valeur en grand = poids maximal (30 %). | `MAQUETTE.md` |
| D8 | **Benchmark** exclu de la matrice et des contributions | La matrice de la maquette ne montre que les actifs de l'allocation. | `MAQUETTE.md` |
| D9 | **Seuil de drawdown** : saisi sur la page Risque, modifiable à tout moment, stocké avec le backtest (nullable), **aucun défaut** (champ vide au départ), entier de 1 % à 99 % ; sans seuil, pas de ligne « Actuelle » | `core-backend` réévalue sans relancer l'engine, à partir du drawdown maximal du résultat (`maxDrawdown`). Hors plage : erreur 400 avec un message traduit (FR / EN). | PO, 2026-11-13 |
| D10 | **Exécution** : risque calculé par l'engine à chaque backtest et stocké ; un ancien backtest n'en a pas tant qu'on ne le relance pas | Un champ ajouté à un résultat stocké est nullable (`AGENTS.md`) ; l'écran affiche `<Dash />` ou un message pour un résultat antérieur, sans recalcul. | PO, 2026-11-13 |
| D11 | **Route** : page autonome `/app/risk?backtest=<id>`, entrée « Risque » dans le groupe « Analyse » de la barre latérale ; sans `backtest`, état vide + bouton « Choisir un backtest » ; le bouton « Risque » du résultat (après « Robustesse ») y mène | La maquette a un fil d'Ariane `Analyse › Risque` et un sélecteur de backtest : la page ne dépend pas d'un résultat ouvert. | PO, 2026-11-13 |
| D12 | **Historique des vérifications** : les **2 dernières** (lignes « Actuelle » et « Précédente ») sont stockées avec le backtest ; la première vérification n'a pas de « Précédente » | La maquette montre deux lignes ; deux suffisent à comparer sans créer de table. | PO, 2026-11-13 |
| D13 | **Volatilité** annualisée sur **toute la période**, pastille « période » (pas de volatilité à 1 an) | Un seul calcul, même base que les autres mesures de risque. | PO, 2026-11-13 |
| D14 | **Phrases de lecture** (paire la plus corrélée, actif qui contribue le plus) : texte i18n dans le web, **valeurs fournies par le backend** | Le web ne recalcule rien ; FR / EN via `messages/`. | PO, 2026-11-13 |
| D15 | Pastille **« Données au … »** de la barre du haut : **supprimée** | La date ne correspond pas à la fin du backtest. | PO, 2026-11-13 |
| D16 | **Données courtes : tout ou rien** (< 250 jours communs) : message « données insuffisantes », aucune carte partielle | Évite des chiffres calculés sur des bases différentes. | PO, 2026-11-13 |
| D17 | **Backtest sans risque** (ancien, en cours, en échec) : message d'état + bouton « Relancer le backtest » | Un ancien résultat n'est pas recalculé (D10) ; l'utilisateur peut le relancer. | PO, 2026-11-13 |
| D18 | **Sélecteur « Choisir un backtest »** : liste des backtests terminés de l'utilisateur | Seuls les résultats terminés ont un risque. | PO, 2026-11-13 |
| D19 | **États chargement et erreur** : mêmes composants et messages que les autres pages | Cohérence du design system. | PO, 2026-11-13 |
| D20 | **Un seul actif** : matrice affichée telle quelle (`1,00`) | Pas de cas particulier à coder. | PO, 2026-11-13 |
| D21 | **Actifs sans historique sur la période** (cas limite de D6) : aucun traitement particulier ; l'intersection des jours communs se réduit et, sous 250 jours, c'est « données insuffisantes » (D16). Aucun actif n'est écarté pour sauver le calcul | Même règle pour tous, rien à coder en plus ; l'utilisateur retire l'actif ou change de période. | PO, 2026-11-13 |

### Encore à trancher

Rien : tous les points ouverts sont tranchés (D1 à D21).

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
