@AGENTS.md

# Revue de code

Pour toute revue (`/code-review`, relecture d'une PR vers `develop`), les règles ci-dessous sont **explicites** dans ce fichier : une violation introduite par le diff est un problème réel (confiance ≥ 80), à signaler en citant la règle. Ne pas les écarter comme « qualité générale » ni comme « détectable par un linter ». Les règles mécaniques (SQL brut, `process.env`, `text-sm`, `<a href>` interne, import relatif entre apps, `import type` des contrats, clés FR/EN) sont déjà bloquées par `bun run verify` (hook + CI) : ne pas les relire.

1. **Responsabilités** : le web calcule une valeur métier (total, métrique, règle) au lieu de l'afficher (AGENTS.md racine, « Responsabilités »).
2. **Couches backend** : logique métier ou `AppError` dans un controller ou un repository ; `prisma`, `req` ou `res` dans un service (apps/core-backend/AGENTS.md, « Règles par couche »).
3. **Propriété des accès** : écriture en base hors core-backend ; appel à yahoo-finance2 hors market-service.
4. **Contrats** : contrat Kafka modifié d'un seul côté (producteur ou consommateur) ; champ numérique sans unité commentée (AGENTS.md racine, « Contrats et événements Kafka »).
5. **Idempotence** : consommateur Kafka dont la transition n'est pas gardée par statut ; message invalide qui lève au lieu de `logger.warn` et retour.
6. **Doublons** : constante métier, helper, type ou composant écrit alors qu'il existe ; type recopié au lieu d'être dérivé de zod ou de Prisma (AGENTS.md racine, « Rangement »).
7. **Catalogues** : route ou composant catalogué créé, modifié ou supprimé sans mise à jour de `API.md` ou `COMPONENTS.md` dans le même diff.
8. **Tests** : comportement ajouté ou transition modifiée sans test dans le même diff.
9. **Web** : élément HTML brut à la place d'une primitive shadcn sans raison en commentaire ; texte affiché en dur au lieu des dictionnaires `messages/` ; locale en dur ; `fetch` hors `api.ts` (apps/web/AGENTS.md).
10. **Engine** : I/O, horloge ou aléa hors paramètre dans `engine/` ; arrondi appliqué à un cumul (apps/backtest-engine/AGENTS.md).
11. **Résultats stockés** : champ ajouté non nullable et sans `@default` côté Prisma, ou obligatoire côté web (AGENTS.md racine, « Conventions communes »).
12. **Périmètre** : refactor, renommage, nouvelle dépendance ou code mort hors de la demande (AGENTS.md racine, « Règle d'or »).
