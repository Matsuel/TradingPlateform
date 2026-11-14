# 13 · Risk Engine — User stories

> Sources : README racine : Risque MUST (drawdown, durée de récupération), SHOULD (corrélations, VaR/CVaR, contribution, contraintes) ; roadmap mois 6. Écran : maquette `33 · Risque` ([`MAQUETTE.md`](MAQUETTE.md)). Décisions D1 à D10 validées le 2026-11-13 : voir `README.md`.

## Point de départ

| Couche | Existant | Manque |
| --- | --- | --- |
| `apps/backtest-engine/engine/backtest.utils.ts` | `createDrawdownTracker`, `annualizedVolatility`, `sharpeRatio`. | Corrélation, VaR, CVaR, contributions, concentration (`engine/risk.ts`). |
| `packages/contracts/src/backtest.ts` | `maxDrawdown`, `volatility` dans `backtestCompletedPayloadSchema`. | Schéma de risque (fichier dédié), seuil de drawdown, codes d'erreur. |
| `apps/core-backend/` | `backtest.service.ts`, `portfolio.service.ts`. | `risk.service.ts`, colonnes nullables (risque, seuil), route du seuil. |
| `apps/web/src/app/(base)/risk` | Dossier vide (pas de page). | Page Risque (`features/risk/`), bouton « Risque » du détail d'un backtest. |

## Conventions de calcul

- **Rendements** : journaliers, en EUR (change inclus, D5), des actifs de l'allocation ; jours de cotation communs à tous les actifs ; 250 jours minimum (D6).
- **Poids** : poids cibles constants (D4). Les versements et le rebalancement n'interviennent pas.
- **Ratios** : volatilité, VaR, CVaR, poids, contributions et HHI sont des ratios (`0,132` = 13,2 %) ; le web convertit en pourcentage. Corrélations : ratio de −1 à 1.
- **VaR 95 %** : avec `n` rendements triés par ordre croissant et `k = ceil(0,05 × n)`, la VaR est le `k`-ième plus petit rendement ; la CVaR est la moyenne des `k` plus petits. Les deux sont ≤ 0 en pratique (perte), un jour (D1).
- **Contribution au risque** de l'actif `i` : `wᵢ (Σw)ᵢ / σ²`, somme = 1 (Σ : covariance des rendements).
- **HHI** : `Σ wᵢ²` ; actifs effectifs = `1 / HHI` ; la valeur en grand de la carte est le poids maximal.
- **Contrainte** : respectée si `|maxDrawdown| ≤ limite` (égalité = respectée) ; `maxDrawdown` est celui du résultat du backtest.

## Hors périmètre

- Facteurs (analyse factorielle, COULD du README).
- VaR paramétrique et VaR de Monte Carlo ; VaR en euros (D1).
- Expositions par secteur et zone (D2).
- Contraintes autres que le drawdown maximal (D3) ; notifications de dépassement.
- Risque des backtests déjà terminés : absent tant qu'ils ne sont pas relancés (D10).
- États non dessinés (voir `README.md`, « Encore à trancher »).

---

## User stories

### Lot 1 — Moteur

#### US-01 · Voir comment mes actifs bougent ensemble — MUST

**En tant que** utilisateur, **je veux** voir la corrélation entre mes actifs et leur part réelle du risque **afin de** comprendre que diversifier, c'est surtout avoir des actifs qui ne bougent pas ensemble.

Critères d’acceptation :
- [ ] La matrice de corrélation (actifs en lignes et en colonnes, ordre de l'allocation) est affichée, deux décimales, diagonale `1,00`, symétrique.
- [ ] Jeu connu : `[1, 2, 3]` et `[2, 4, 6]` → `1` ; `[1, 2, 3]` et `[3, 2, 1]` → `−1` ; `[1, −1, 1, −1]` et `[1, 1, −1, −1]` → `0`.
- [ ] Les contributions au risque somment à 100 %. Jeu connu : deux actifs non corrélés, poids 50/50, volatilités 10 % et 20 % → contributions `0,2` et `0,8`.
- [ ] La concentration est affichée : HHI et actifs effectifs. Jeu connu : poids 30/30/30/10 → HHI `0,28`, `3,6` actifs effectifs, poids maximal `30 %`.
- [ ] Les valeurs sont celles du backend ; le web ne recalcule rien.
- [ ] Les phrases de lecture (paire la plus corrélée, actif contribuant le plus) sont des textes i18n FR / EN dont les valeurs viennent du backend (D14).
- [ ] La volatilité annualisée porte sur toute la période, pastille « période » (D13).

Tâches : T-01, T-03, T-04, T-06 (détail dans `TASKS.md`).

---

#### US-02 · Connaître la perte qu'un mauvais jour peut coûter — MUST

**En tant que** utilisateur, **je veux** voir la VaR et la CVaR à 95 % **afin de** mesurer le risque au-delà du drawdown.

Critères d’acceptation :
- [ ] VaR et CVaR à 95 % sont affichées en pourcentage, avec la mention « historique, un jour » (D1).
- [ ] Jeu connu : 100 rendements `k / 100` pour `k` de −50 à 49 → `k = 5`, VaR `−0,46`, CVaR `−0,48`.
- [ ] Sous 250 jours de cotation communs, aucun risque n'est calculé : la page affiche le seul message « données insuffisantes », sans carte partielle (D6, D16).
- [ ] Un backtest antérieur à la feature, en cours ou en échec n'a pas de risque : message d'état et bouton « Relancer le backtest », sans recalcul (D10, D17).

Tâches : T-02, T-04, T-06 (détail dans `TASKS.md`).

---

### Lot 2 — Contrat et service

#### US-03 · Vérifier une contrainte de risque — SHOULD

**En tant que** utilisateur, **je veux** fixer un drawdown maximal et voir s'il est respecté **afin de** savoir si la stratégie historique respecte ma limite.

Critères d’acceptation :
- [ ] Je saisis un entier de 1 % à 99 % (champ vide au départ) ; le seuil est enregistré avec le backtest et modifiable à tout moment (D9).
- [ ] Le résultat indique « Respectée » ou « Non respectée » avec la valeur mesurée. Jeux connus : `maxDrawdown` `−0,214`, limite `0,15` → non respectée ; limite `0,25` → respectée ; limite `0,214` → respectée.
- [ ] Hors plage (0 %, 100 %, texte, vide) : erreur 400, message traduit FR / EN, seuil inchangé.
- [ ] Changer le seuil ne relance pas l'engine : `core-backend` réévalue à partir du `maxDrawdown` stocké.
- [ ] Sans seuil saisi, pas de ligne « Actuelle ».
- [ ] Les 2 dernières vérifications sont conservées avec le backtest : « Actuelle » et « Précédente » ; la première vérification n'a pas de « Précédente » (D12).
- [ ] La mention « Le passé ne garantit pas l’avenir : une limite respectée sur l’historique peut être dépassée demain. » accompagne le résultat.

Tâches : T-04, T-05, T-07 (détail dans `TASKS.md`).

---

### Lot 3 — Écrans

#### US-04 · Ouvrir la page Risque d'un backtest — SHOULD

**En tant que** utilisateur, **je veux** ouvrir la page Risque depuis le menu ou depuis un résultat **afin de** consulter le risque d'un backtest choisi.

Critères d’acceptation :
- [ ] La page est `/app/risk?backtest=<id>` ; entrée « Risque » dans le groupe « Analyse » de la barre latérale (D11).
- [ ] Le bouton « Risque » de l'en-tête du résultat (contour, après « Robustesse ») ouvre la page du backtest affiché.
- [ ] Sans `backtest` : état vide et bouton « Choisir un backtest » ; backtest d'un autre utilisateur ou inconnu : erreur traduite.
- [ ] Badge `Calculé` seulement quand le risque est présent ; la pastille « Données au … » n'existe pas (D15).
- [ ] États : vide, chargement, données insuffisantes, sans risque (message + « Relancer le backtest »), erreur ; thème sombre et mobile.

Tâches : T-06, T-09 (détail dans `TASKS.md`).

L'écran regroupe les US ci-dessus : page Risque (maquette 33, six blocs) et bouton « Risque » du résultat d'un backtest (cadre 13), détaillés dans `TASKS.md`.

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Voir comment mes actifs bougent ensemble | MUST | 1 | backtest-engine, contracts, core-backend, web |
| US-02 | Connaître la perte qu'un mauvais jour peut coûter | MUST | 1 | backtest-engine, contracts, core-backend, web |
| US-03 | Vérifier une contrainte de risque | SHOULD | 2 | contracts, core-backend, web |
| US-04 | Ouvrir la page Risque d'un backtest | SHOULD | 3 | web |
