# Roadmap — suivi des features

Trace de ce qui a été fait, comment, et de ce qui est prévu. Un dossier par feature, dans l’ordre chronologique : `README.md` (objectif, approche, décisions, bilan), `US.md` (user stories), `TASKS.md` (tâches, points, dépendances).

La vision et la roadmap annuelle restent dans le [`README.md`](../README.md) racine. Ce dossier en est le suivi d’exécution. Il est maintenu avec le skill `feature-roadmap` (`.claude/skills/feature-roadmap/`) : planification d’une nouvelle feature, rétro d’une feature livrée, clôture.

- **Maquettes** : Figma `Trading`, clé `DmpvF0SdUJGCBfA6GsdErm`, page `0:1`.

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
| 08 | [Portfolio Management V1](08-portfolio-v1/) | 4 | à partir du 2026-10-30 | — | Planifiée | 98 |

ᵃ estimés a posteriori d’après les diffs.

| Mois | Features | Points |
| --- | --- | --- |
| 1 — Cadrage et socle | 01, 02, 03, 04 | 75 ᵃ |
| 2 — Strategy Lab MVP | 05, 06 | 58 ᵃ |
| 3 — Clôture du Strategy Lab | 07 | 24 ᵃ |
| 4 — Portfolio Management V1 | 08 | 98 (prévus) |

## Journal des décisions structurantes

| Date | Décision | Trace |
| --- | --- | --- |
| 2026-10-26 | Le calcul de backtest quitte `core-backend` pour un worker Kafka dédié (`backtest-engine`, issu du renommage de `matching-engine`) ; le plan initial le gardait synchrone dans l’API. | `abcbb28`, [05](05-strategy-lab-mvp/) |
| 2026-10-27 | Conventions d’architecture écrites dans des `AGENTS.md` par dossier ; `core-backend` devient la référence. | `a0e982d` |
| 2026-10-28 | Les données de marché sortent dans `market-service`, appelé uniquement via le proxy de `core-backend`. | `5a3632d`, [06](06-market-service/) |
| 2026-10-29 | Pivot : de la bourse simulée au laboratoire de portefeuille ; carnet d’ordres et matching engine deviennent un bonus. | `5f0890c`, [07](07-strategy-lab-cloture/) |
| 2026-10-30 | Messages Kafka compressés en GZIP (limite de 1 Mo du broker). | `e87fdcc` |

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
