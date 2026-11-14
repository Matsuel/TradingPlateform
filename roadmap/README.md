# Roadmap — suivi des features

Trace de ce qui a été fait, comment, et de ce qui est prévu. Un dossier par feature, dans l’ordre chronologique : `README.md` (objectif, approche, décisions, bilan), `US.md` (user stories), `TASKS.md` (tâches, points, dépendances).

La vision et la roadmap annuelle restent dans le [`README.md`](../README.md) racine. Ce dossier en est le suivi d’exécution. Il est maintenu avec le skill `feature-roadmap` (`.claude/skills/feature-roadmap/`) : planification d’une nouvelle feature, rétro d’une feature livrée, clôture.

- **Maquettes** : Figma `Trading`, clé `DmpvF0SdUJGCBfA6GsdErm`, page `0:1`. Une section par feature ou par mois, écrans numérotés dans l’ordre des features.
- **Écrans modifiés** : la ligne du même nom du `README.md` de chaque feature liste les cadres Figma existants qu'elle change (bouton, bloc, lien), avec leur état : `à dessiner`, `à mettre à jour` ou `mise à jour faite`. Dans Figma, la section de la feature contient une copie de chacun de ces écrans, nommée `<écran> · à modifier (F<NN>)`, à côté de ses nouveaux écrans : tout ce qui se travaille pour la feature se voit au même endroit (l'original reste dans sa section). **Étape par étape** : la copie ne montre que les changements de sa feature et des précédentes, jamais ceux des suivantes ; l'original ne reçoit le changement qu'au codage de la feature (états : `à dessiner`, `dessiné dans la copie`, `mise à jour faite` une fois codé).

### Renumérotation des maquettes (2026-11-01)

Les dossiers des features 02 à 08 citent les anciens numéros ; cette table les traduit. Les `node-id` n’ont pas changé.

| Ancien | Nouveau | Ancien | Nouveau |
| --- | --- | --- | --- |
| 01 · Connexion | 01 | 19 v2 · Comparaison de backtests | 14 |
| 02 · Inscription | 02 | 26 · Aide sur une donnée (sheet) | 15 |
| 16 · Page 404 | 03 | — · Déclencheur de l’aide | 15.1 |
| 17 · Page d’erreur | 04 | | |
| 03 · Dashboard (03.1 sombre) | 05 (05.1) | 20 · Risque (+ contraintes, proposée) | 17 (17.1) |
| 10 · Paramètres / Profil | 06 | 21 · Projection Monte Carlo (+ paramètres, proposée) | 18 (18.1) |
| 10.2 · Notifications, 10.3 · Apparence | 06.1, 06.2 | 22 · Explorateur d’allocations (+ nouvelle exploration, proposée) | 19 (19.1) |
| 04 · Marché | 07 | 23 · Paper trading (+ nouvelle stratégie, proposée) | 20 (20.1) |
| 04.1 · Recherche de symboles | 07.1 | — (proposée) · Rapports (liste) | 21 |
| 05 · Détail d’un symbole | 08 | 24 · Rapport gestionnaire | 21.1 |
| 14 · Monitoring | 09 | 25 · Notifications (25.1 toaster) | 22 (22.1) |
| 18 · Utilisateurs | 10 | — (proposée) · Données de référence | 23 |
| 11 · Liste des backtests | 11 | — (proposée) · Trace d’une exécution | 24 |
| 12.1 · Nouveau backtest · Allocation | 12 | 06, 07, 08, 09 (bonus trading et alertes) | 25, 26, 27, 28 |
| 06.1 · Test rapide (sheet) | 12.1 | 10.1 · Portefeuille virtuel, 10.4 · Réinitialiser | 29, 29.1 |
| 13 v2 · A · Résultat d’un backtest | 13 | 12, 13 (v1), 13 v2 · B et C, 19 (v1) | archives |

## Features

| # | Feature | Mois | Période | PR | Statut | Points |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | [Socle technique](01-socle-technique/) | 1 | 2026-09-30 → 2026-10-19 | — | Livrée | 18 ᵃ |
| 02 | [Authentification et layout](02-authentification-et-layout/) | 1 | 2026-10-06 → 2026-10-28 | — | Livrée | 28 ᵃ |
| 03 | [Marché](03-marche/) | 1 | 2026-10-16 → 2026-10-28 | #1 | Livrée | 23 ᵃ |
| 04 | [Rôles et administration](04-roles-administration/) | 1 | 2026-10-26 | #2 | Livrée | 6 ᵃ |
| 05 | [Strategy Lab MVP](05-strategy-lab-mvp/) | 2 | 2026-10-24 → 2026-10-28 | #3 | Livrée | 50 ᵃ |
| 06 | [Extraction de market-service](06-market-service/) | 2 | 2026-10-28 | #3 | Livrée | 8 ᵃ |
| 07 | [Clôture du Strategy Lab](07-strategy-lab-cloture/) | 3 | 2026-10-29 → 2026-10-30 | #3 | Livrée | 24 ᵃ |
| 08 | [Portfolio Management V1](08-portfolio-v1/) | 4 | 2026-10-30 → 2026-10-31 | — | Livrée | 104 |
| 09 | [Aide contextuelle sur les données](09-aide-contextuelle/) | 4–5 ᵇ | 2026-11-01 | — | Livrée | 28 |
| 10 | [Internationalisation et apparence du web](10-internationalisation/) | 5 | — | — | En cours (T-11 restant) | 50 |
| 11 | [Dividendes, splits et effet devise](11-dividendes-splits-devise/) | 5 | 2026-11-12 | — | Livrée | 36 |
| 12 | [Robustesse : dates de départ et métriques glissantes](12-robustesse-dates-de-depart/) | 5 | 2026-11-13 | #10 | Livrée | 36 |

ᵃ estimés a posteriori d’après les diffs.
ᵇ hors « Roadmap annuelle » : demande du 2026-10-30, après le lot 3 de la feature 08.

| Mois | Features | Points |
| --- | --- | --- |
| 1 — Cadrage et socle | 01, 02, 03, 04 | 75 ᵃ |
| 2 — Strategy Lab MVP | 05, 06 | 58 ᵃ |
| 3 — Clôture du Strategy Lab | 07 | 24 ᵃ |
| 4 — Portfolio Management V1 | 08 | 104 |

## Features à venir (ordre d’exécution)

Ordre fixé le 2026-11-03 d’après les dépendances, pas d’après les mois seuls. L’internationalisation (10) est **urgente** : elle passe avant toute nouvelle page, pour que les écrans suivants naissent traduits. Chaque feature est planifiée avec le skill `feature-roadmap` (dossier `roadmap/<NN>-<slug>/`). « Dépend de » liste les features qui doivent être **livrées** avant.

Planification : **toutes les features 10 à 24 sont planifiées** (dossiers `roadmap/<NN>-<slug>/`, statut `Planifiée`). Maquettes Figma 31 à 40 : **dessinées** (aucune pour 21 à 24, infrastructure).

| # | Feature | Mois | Dépend de | Pourquoi à cette place |
| --- | --- | --- | --- | --- |
| 10 | Internationalisation et apparence du web (FR / EN, thème) | 5 · urgente | 09 | Toute nouvelle page doit naître traduite ; retrofit coûteux sinon. Inclut l’onglet Paramètres > Apparence (thème, langue). |
| 11 | Dividendes, splits et effet devise | 5 | 08 | Change tous les rendements (rendement total). Le forward des options en a besoin. |
| 12 | Robustesse : dates de départ et métriques glissantes | 5 | 11 | Sensibilité à la date d’entrée, sur des rendements corrects. |
| 13 | Risk Engine | 6 | 11 | Corrélations, expositions, concentration, VaR/CVaR, contraintes. Gel fonctionnel du moteur de simulation à la fin. |
| 14 | Projection Monte Carlo | 7 | 12 | Moteur seedé réutilisé par le pricing (18). |
| 15 | Taux et obligations | 8 | 08 | Source de taux (Yahoo, gratuit ; FRED reporté), courbe, actualisation, prix, duration. Indépendant du risque. |
| 16 | Options vanilles : payoffs et Black-Scholes | 9 | 11, 15 | Besoin du taux (15) et des dividendes (11). |
| 17 | Grecques, volatilité implicite et surface | 9 | 16 | Route `options/:symbol` dans `market-service` ; volatilité implicite recalculée par le moteur. |
| 18 | Pricing Monte Carlo et option à barrière | 10 | 14, 16 | Moteur de 14, validé contre Black-Scholes (16). |
| 19 | Produits structurés : décomposition, juste valeur, marge | 10 | 15, 17, 18 | Capital garanti, reverse convertible, autocallable. |
| 20 | Stress de produit et term sheet | 10 | 13, 19 | Chocs sur sous-jacent, volatilité et taux ; fiche produit. |
| 21 | Pipeline CI/CD et images | 11 | — | Voir la note ci-dessous. |
| 22 | Kubernetes, Helm et Argo CD | 11 | 21 | Environnements `dev` / `demo`. |
| 23 | Observabilité : OpenTelemetry, traces, runbooks | 11 | 22 | Trace d’une simulation de bout en bout. ClickHouse seulement si une requête analytique le justifie. |
| 24 | Résilience et soutenance | 12 | 23 | Reprise du worker et des consumers, sauvegarde-restauration, pannes contrôlées, charge, audit sécurité, démo, rapport. |

**Extensions (COULD, hors chemin critique)** : delta-hedging (après 19), optimisation minimale Max Sharpe / min variance (après 13), objectifs financiers et taux de retrait (après 14), paper trading, notifications, profils de clients fictifs, marché simulé (bonus).

**CI/CD (21)** : aucune dépendance fonctionnelle, donc libre d’être avancée. Les moteurs de pricing (16 à 20) sont les plus lourds en tests ; un pipeline qui exécute `bun test` et `tsc` à chaque PR avant la 16 les protégerait. Décision à prendre par l’utilisateur ; l’ordre ci-dessus garde le mois 11 d’origine.

## Journal des décisions structurantes

| Date | Décision | Trace |
| --- | --- | --- |
| 2026-10-26 | Le calcul de backtest quitte `core-backend` pour un worker Kafka dédié (`backtest-engine`, issu du renommage de `matching-engine`) ; le plan initial le gardait synchrone dans l’API. | `abcbb28`, [05](05-strategy-lab-mvp/) |
| 2026-10-27 | Conventions d’architecture écrites dans des `AGENTS.md` par dossier ; `core-backend` devient la référence. | `a0e982d` |
| 2026-10-28 | Les données de marché sortent dans `market-service`, appelé uniquement via le proxy de `core-backend`. | `5a3632d`, [06](06-market-service/) |
| 2026-10-29 | Pivot : de la bourse simulée au laboratoire de portefeuille ; carnet d’ordres et matching engine deviennent un bonus. | `5f0890c`, [07](07-strategy-lab-cloture/) |
| 2026-10-30 | Messages Kafka compressés en GZIP (limite de 1 Mo du broker). | `e87fdcc` |
| 2026-10-30 | Aide contextuelle ajoutée hors roadmap annuelle : chaque donnée calculée affichée porte une explication (à quoi elle sert, comment elle est calculée). | [09](09-aide-contextuelle/) |
| 2026-11-03 | Cap « structureur » : la roadmap des mois 5 à 10 passe de l’optimisation et du reporting à la structuration (taux, obligations, options, produits structurés, term sheet). Optimisation, paper trading, notifications et profils de clients passent en COULD ; CI/CD, Kubernetes, Helm et GitOps (mois 11-12) sont conservés. | [README racine](../README.md#structuration--taux-options-et-produits-structurés) |

## Conventions communes

S’appliquent à tous les dossiers ; les `TASKS.md` y renvoient au lieu de les répéter.

### Statuts

| Statut | Sens |
| --- | --- |
| Planifiée | US et tâches écrites, aucun code. |
| En cours | Au moins une tâche commencée. |
| Livrée | Mergée ; critères cochés, bilan écrit. |

### Priorités

**MUST** : demandé par la ligne de roadmap du mois. **SHOULD** : visible dans la maquette ou utile, à faire si le MUST est terminé. **COULD** : bonus.

### Points d’effort

Suite de Fibonacci ; effort relatif, pas des heures. En rétro, les points sont estimés a posteriori d’après la taille et la difficulté du diff.

| Points | Repère |
| --- | --- |
| 1 | Changement trivial, un fichier, pas de test nouveau. |
| 2 | Petit changement localisé, quelques tests ou une entrée de catalogue. |
| 3 | Plusieurs fichiers d’une même couche, tests à écrire. |
| 5 | Plusieurs couches ou logique non triviale, cas limites à couvrir. |
| 8 | Cœur de calcul délicat ou migration risquée ; à découper si l’estimation grossit. |

### Dépendances

« Dépend de » liste les tâches qui doivent être **terminées** avant de commencer. « — » : aucune dépendance dans la feature.

### Définition de terminé commune

Chaque tâche, en plus de ses propres critères :
- `bunx tsc --noEmit` passe dans chaque app/package touché ; `bun test` dans `apps/backtest-engine` si l’engine change ; `bun run lint` dans `apps/web` si le front change.
- Le diff web ne contient que de l’affichage ; tout calcul vit chez son propriétaire (engine ou service `core-backend`).
- Aucune constante, aucun type ni helper dupliqué (types dérivés du contrat ou de Prisma).
- `API.md` / `COMPONENTS.md` à jour pour toute route ou tout composant catalogué créé ou modifié.
- Changement de contrat : producteur et consommateur mis à jour dans le même diff, services concernés redémarrés.
- Champ numérique ajouté au contrat : unité documentée en commentaire.
