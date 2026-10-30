---
name: feature-roadmap
description: Écrit le dossier `roadmap/<NN>-<slug>/` d'une feature (README, US, tâches, points d'effort, dépendances). Use when démarrer une feature ou un mois de la roadmap, documenter après coup une feature déjà livrée depuis l'historique git, ou clôturer une feature terminée.
---

# feature-roadmap

Chaque feature du projet a un dossier `roadmap/<NN>-<slug>/` contenant `README.md`, `US.md` et `TASKS.md`. `roadmap/README.md` est l'index et fait foi pour les conventions communes : échelle de points, statuts, priorités, définition de terminé commune. Lis-le en premier, à chaque fois.

Trois modes. Choisis-en un d'après la demande :

| Mode | Quand | Statut écrit |
| --- | --- | --- |
| **Planification** | La feature n'est pas commencée (« on démarre le mois 5 »). | `Planifiée` |
| **Rétro** | La feature est déjà dans l'historique git ; on reconstitue ce qui a été fait et comment. | `Livrée` |
| **Clôture** | Une feature `Planifiée` ou `En cours` vient d'être terminée. | `Livrée` |

Les gabarits sont dans `templates/` (à côté de ce fichier). Copie leur structure ; supprime les sections marquées « planification seulement » en mode rétro.

## Mode planification

1. **Cadrer** : retrouve la ligne de la feature dans `README.md` (« Roadmap annuelle » et la section détaillée du domaine), puis la ligne suivante de l'index `roadmap/README.md` pour le numéro `NN`. Le slug est court, en kebab-case français (`portfolio-v1`).
2. **Lire la maquette** : la clé du fichier Figma est dans `roadmap/README.md`. `create_session`, puis `get_metadata` sur la page : la réponse dépasse la limite, elle est enregistrée dans un fichier ; liste les cadres avec `jq -r '.[0].text'` puis `grep -E '^    <frame'`. Fais un `get_screenshot` de chaque écran concerné et regarde-le. Terminé quand chaque écran de la feature est nommé dans `US.md` avec son numéro de maquette.
3. **Mesurer l'existant** : lis le code de chaque couche que la feature touche (contrat, engine, schéma Prisma, interfaces, feature web). Terminé quand le tableau « Point de départ » dit, couche par couche, ce qui existe et ce qui manque, avec des noms de fichiers ou de symboles réels.
4. **Décider** : chaque choix qui engage le contrat, la base ou une unité devient une décision `D<n>` (proposition + raison). Une décision irréversible (suppression de colonne, rupture d'API) le dit explicitement.
5. **Écrire `US.md`** : US au format « En tant que / je veux / afin de », priorité MUST (roadmap) ou SHOULD (maquette au-delà de la roadmap), critères d'acceptation vérifiables, tâches par couche. Ce qui relève d'un mois ultérieur est listé en « Hors périmètre ». Une valeur métier vue dans la maquette est attribuée au backend, jamais au web (règle « Responsabilités » de `AGENTS.md`).
6. **Écrire `TASKS.md`** : une tâche = un diff cohérent dans une couche, estimable seule. Chaque tâche : US, couche, priorité, points, « Dépend de », fichiers, critères. Puis le tableau de synthèse, les totaux par lot, le chemin critique, ce qui est parallélisable et le graphe Mermaid.
7. **Écrire `README.md`** de la feature (statut `Planifiée`) et ajouter sa ligne à l'index.

## Mode rétro

1. **Délimiter** : trouve les commits de la feature. Pour une PR : `git log <merge>^1..<merge>^2`. Sinon par dates, préfixe de commit (`feat(backtest)`) et chemins (`git log -- <dossier>`). Un commit transverse va dans la feature qu'il sert le plus ; s'il en sert plusieurs, cite-le dans chacune.
2. **Lire** : `git show --stat` de chaque commit, le corps du message, et le diff des fichiers centraux (schéma, contrat, engine, service, écran principal). Cherche les plans d'époque (`git log -- docs/`) : ils disent l'intention et les écarts.
3. **Reconstituer** : les US décrivent la valeur livrée à l'utilisateur ; les tâches décrivent les diffs réels, chacune avec ses commits (`abc1234`). Toutes les cases sont cochées. Les points sont **estimés a posteriori** d'après la taille et la difficulté du diff, et marqués comme tels. Les dépendances sont celles observées dans l'ordre des commits et les imports.
4. **Raconter le comment** : le `README.md` de la feature dit l'approche technique, les décisions prises (avec le commit qui les montre), les écarts au plan initial, les limites et la dette laissées. Terminé quand chaque commit de la plage apparaît dans au moins une tâche.
5. Ajoute la ligne à l'index.

## Mode clôture

1. Coche les critères réellement vérifiés ; une case non cochée reste visible avec la raison.
2. Ajoute à chaque tâche ses commits et ses points réalisés (colonne « Réalisé ») ; un écart de plus d'un cran de l'échelle est expliqué en une ligne.
3. Remplis « Bilan » dans le `README.md` de la feature (livré, écarts, dette) et passe le statut à `Livrée` dans le README et l'index.

## Vérification (tous les modes)

Lance `bun .claude/skills/feature-roadmap/check.ts roadmap/<NN>-<slug>`. Le script vérifie que la somme des points égale le total annoncé, que chaque dépendance existe et qu'il n'y a pas de cycle, que chaque US est couverte par au moins une tâche. Terminé quand il sort sans erreur et que l'index liste la feature avec ses points.
