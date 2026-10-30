# 03 · Marché

- **Statut** : Livrée
- **Roadmap** : Mois 1 — recherche d’actifs et graphiques historiques
- **Période** : 2026-10-16 → 2026-10-20, restructuration le 2026-10-28
- **Branche / PR** : `feat/market` — #1 (merge `45796ed`)
- **Points** : 23 (MUST 23) — estimés a posteriori
- **Maquettes** : `04 · Marché`, `04.1 · Recherche de symboles (dialog)`, `05 · Détail d’un symbole`

## Objectif

Donner accès aux données de marché : une liste d’actifs suivis avec leur tendance, une recherche de symboles et la fiche d’un symbole avec son graphique historique. C’est la porte d’entrée du Strategy Lab (test rapide depuis la fiche, feature 05).

## Comment

- **Backend** : domaine `market` en couches dans `core-backend` (routes, controller, service, repository) ; le repository interroge yahoo-finance2 (`9bda25e`). Liste d’actifs par défaut en constante (`constants/market.constants.ts`, `d8caf98`). Ce code a ensuite migré dans `market-service` (feature 06).
- **Web** : page Marché en tableau avec sparklines (`components/ui/chart.tsx`, `sparkline.tsx`, `1059be2`), données via React Query et un client `lib/api.ts` (`3294e86`). Le tableau devient un `DataTable` générique (TanStack Table) avec clic sur ligne, et le code passe en `features/market/` (`api.ts`, `hook.ts`, `column.tsx`, `types.ts`) avec `lib/format.ts` (`9f2e3e2`, `d00e679`).
- **Fiche symbole** : route `/app/market/[symbol]`, `PageLayout` / `PageHeader`, graphique de prix (`components/chart.tsx`), `AppSheet` pour les panneaux latéraux (`e6a0873` → `c4651f9`).
- **Recherche** : dialog de commande (cmdk) branchée sur l’API de recherche (`aaee3fa`).
- **Restructuration** : composants regroupés en `market-list.tsx`, `price-chart.tsx`, `symbol-detail.tsx`, `symbol-search.tsx`, `symbol-sheet.tsx` et constantes de feature (`09454d3`).

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | yahoo-finance2 comme fournisseur de données de référence, appelé côté serveur uniquement. | Gratuit, historique long ; le navigateur n’appelle jamais un fournisseur externe. | `9bda25e` |
| D2 | React Query pour toutes les lectures web. | Cache, états de chargement et d’erreur uniformes. | `3294e86` |
| D3 | `DataTable` générique partagé. | Même tableau pour marché, backtests, ordres. | `9f2e3e2` |
| D4 | Organisation par `features/<domaine>/`. | Un domaine = un dossier ; devenu la règle du web. | `9f2e3e2` |

## Écarts au plan

Le README prévoit des données « persistées par MarketFlow » ; ici les cours sont lus en direct chez Yahoo à chaque requête. La persistance est reportée au mois 10 (« Données et historique »).

## Bilan

Parcours marché livré. Dette : pas de cache ni de persistance des cours ; la case de la « Définition de terminé » sur les données persistées reste ouverte.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
