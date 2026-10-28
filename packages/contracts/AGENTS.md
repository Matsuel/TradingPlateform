# @trading-plateform/contracts

**Source unique de vérité** des données échangées entre services : topics, schémas zod des payloads et de l'enveloppe, types `z.infer`. Uniquement des définitions : pas de logique ni d'I/O. Respecte `../../AGENTS.md`.

## Règles

- Un fichier par domaine (`src/<domaine>.ts`) ; l'enveloppe générique `kafkaEventSchema` vit dans `src/event.ts`. Tout est réexporté par `src/index.ts`.
- Topics : une constante objet par domaine (`BACKTEST_TOPICS`), valeurs `domaine.action`. Aucun topic écrit en dur ailleurs.
- Chaque payload a son schéma (`<x>PayloadSchema`), son schéma d'événement (`<x>EventSchema = kafkaEventSchema(...)`) et son type (`<X>Payload = z.infer<...>`).
- Chaque champ numérique ou date documente son unité en commentaire : ratio (`0.342` = 34,2 %), montant et devise, `z.iso.date()` (`YYYY-MM-DD`) ou `z.iso.datetime()`.
- Les apps dérivent leurs types de ces exports (`Pick`, `Omit`, `z.infer`) ; elles ne redéclarent jamais un payload.

## Faire évoluer un contrat

1. Modifie le schéma dans `src/<domaine>.ts`.
2. Champ ajouté **obligatoire** = changement cassant : mets à jour producteur et consommateurs dans le même diff (`backtest-engine`, `core-backend` : colonne, migration, service), puis signale qu'il faut redémarrer les services.
3. Champ optionnel ou nullable = rétrocompatible ; sinon, nouvelle `version` de l'enveloppe.
