# 11 · Dividendes, splits et effet devise

- **Statut** : Planifiée
- **Roadmap** : Mois 5 — Mois 5 — Robustesse (dividendes, splits, effet devise)
- **Période** : à fixer au démarrage de la feature
- **Branche / PR** : `feat/dividendes-splits-devise` — PR à ouvrir
- **Points** : 22 (MUST 16, SHOULD 6) — prévus
- **Maquettes** : `31 · Résultat avec dividendes` (à créer, agent Figma)
- **Dépend de** : 08 (livrée) ; 10 (i18n) pour les nouveaux libellés.

## Objectif

L'utilisateur voit le rendement réel d'un titre, dividendes compris, et la part due au change pour un actif en dollars. Sans cela, toutes les métriques des features 08 à 14 sont fausses pour les titres qui versent des dividendes.

## Comment

Moteur : `chart` avec `events: 'div|split'`, réinvestissement dans `runBacktest`, conversion EUR/USD par série journalière. Contrat : `priceType` enrichi (ajout). Base : deux colonnes nullables. Web : deux lignes d'affichage.

## Décisions

| # | Décision | Raison | Trace |
| --- | --- | --- | --- |
| D1 | **Dividendes** : Réinvestis au cours de l'ex-date, sans frais | Un réinvestissement est un rachat ; le frais par ordre (D8 de 08) s'applique aux ordres de stratégie, pas aux dividendes. Option « encaissés en cash » reportée. | `US.md` (à valider) |
| D2 | **Type de cours** : Ajout de `TOTAL_RETURN` à `priceType` | Ajout pur : les résultats `CLOSE_SPLIT_ADJUSTED` restent lisibles, sans recalcul. | `US.md` (à valider) |
| D3 | **Devise de référence** : EUR ; conversion au cours du jour | Cohérent avec le hors périmètre (comptes mono-devise EUR). Pas de conversion au cours de départ (non demandé). | `US.md` (à valider) |

## Écarts au plan

Aucun : feature planifiée, rien de livré.

## Bilan

À écrire à la clôture de la feature.

## Fichiers

- [`US.md`](US.md) — user stories et critères d’acceptation
- [`TASKS.md`](TASKS.md) — tâches, points, dépendances
