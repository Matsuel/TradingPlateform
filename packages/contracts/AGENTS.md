# @trading-plateform/contracts

Schémas zod et types partagés entre services (payloads d'événements, DTO inter-services). Réexporter via `src/index.ts`. Un contrat change → mettre à jour tous les consommateurs. Pas de logique, uniquement des définitions. Respecte `../../AGENTS.md`.

## Ajouter un contrat

1. Un fichier par domaine dans `src/<domaine>.ts` : schéma zod + `z.infer` exporté.
2. Réexporter via `src/index.ts`.
3. Utilisé par les deux côtés (producteur et consommateur) ; changement = rétrocompatible, sinon mettre à jour tous les consommateurs.
4. Uniquement des définitions : pas de logique ni d'I/O.
