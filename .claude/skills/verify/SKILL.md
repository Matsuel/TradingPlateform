---
name: verify
description: Contrôles « Avant de rendre la main » du dépôt sur le diff courant (tsc, tests, lint, catalogues, SQL brut, doublons). Use when une tâche de code est finie, avant de la déclarer terminée, de committer ou d'ouvrir une PR.
---

# verify

Exécute la section « Avant de rendre la main » de `AGENTS.md` sur le diff courant. Le script couvre ce qui se vérifie mécaniquement ; le reste se juge en relisant le diff.

1. **Lancer** `bun .claude/skills/verify/verify.ts` depuis n'importe quel dossier du dépôt. La base par défaut est la merge-base avec `develop` (sur `develop`, les changements non commités) ; passe une autre base en argument si besoin (`bun .claude/skills/verify/verify.ts main`).
   Le script détecte les workspaces touchés et leurs dépendants (un changement dans `packages/contracts` vérifie toutes les apps qui l'importent), puis lance `bunx tsc --noEmit` dans chacun, `bun test` si `backtest-engine` est concerné, `bun run lint` si `apps/web` change. Il échoue sur un `.env` dans le diff, du SQL écrit à la main hors migration, un fichier de `generated/` modifié, un `schema.prisma` modifié sans migration. Il avertit sur `any`, `console.*`, catalogue inchangé, contrat modifié d'un seul côté, déclaration exportée dont le nom existe déjà.
2. **Corriger chaque ✗** puis relancer. Terminé quand le script sort avec le code 0.
3. **Traiter chaque ⚠** : corrige, ou garde-le et justifie-le en une ligne dans le résumé rendu à l'utilisateur (ex. catalogue inchangé parce que la route n'a pas changé de contrat).
4. **Relire le diff** (`git diff <base>`) pour les règles que le script ne peut pas juger :
   - **Responsabilités** : le diff web ne contient que de l'affichage ; un nouveau calcul vit chez son propriétaire (engine, service `core-backend`).
   - **Périmètre** : rien hors de la demande, aucun fichier de debug ni généré oublié.
   - **Résultats qui évoluent** : un champ ajouté à un résultat stocké est nullable côté Prisma et optionnel côté web, avec `<Dash />` pour un résultat antérieur.

Terminé quand le script sort en 0, que chaque avertissement est corrigé ou justifié, et que les trois points de relecture sont vérifiés. Le résumé à l'utilisateur liste les commandes lancées avec leur résultat, tel quel : un contrôle qui n'a pas pu tourner est signalé comme tel, jamais présenté comme passé.
