# backtest-engine

Worker Kafka sans HTTP **et sans base de données**. Consomme `backtest.requested` (publié par core-backend, contient tous les paramètres), récupère les cours via yahoo-finance2, calcule, puis publie `backtest.started` puis `backtest.completed` (résultat) ou `backtest.failed` (cause). **Calqué sur `apps/core-backend`** : lis `../core-backend/AGENTS.md` et reprends ses règles de couches. Respecte `../../AGENTS.md`.

S'il manque une donnée pour calculer, ajoute-la au contrat `backtest.requested` : seul core-backend lit et écrit la base.

## Structure (à respecter, crée un dossier seulement quand un fichier en a besoin)

```
index.ts           bootstrap : instancie Kafka, câble publisher → service → consumer, abonne. Aucune logique.
consumers/         <domaine>.consumer.ts : valide l'événement (zod), appelle le service    (≈ controller)
services/          <domaine>.service.ts : orchestre repository + engine + publisher          (≈ service)
engine/            calcul pur et déterministe + ses tests <domaine>.engine.test.ts
                   <domaine>.utils.ts : briques de calcul réutilisables (arrondi, calendrier, drawdown), testées dans <domaine>.utils.test.ts
                   <domaine>.fixture.ts : jeux de cours déterministes partagés par les tests
repositories/      I<X>Repository + classe : sources externes en lecture (cours de marché)
publishers/        I<X>Publisher + classe : publication des événements de sortie
interfaces/        types du domaine (<domaine>.interface.ts), dérivés des contrats
errors/            erreurs métier (<nom>.error.ts)
constants/         constantes (<domaine>.constants.ts)
```

## Responsabilités par couche

- **engine/** est le **propriétaire de tous les calculs de simulation** : valeur, montant investi, rendement, drawdown, ordres, courbe. Toute métrique affichée par le web est calculée ici, ajoutée au contrat `backtest.completed`, stockée par core-backend. Pur : mêmes entrées → mêmes sorties, aucune I/O, aucun Kafka, horloge et aléa uniquement par paramètre. Chaque métrique a son `bun test`.
- **Lisibilité de l'engine** : `<domaine>.engine.ts` garde la boucle de simulation et le point d'entrée (`runBacktest`) ; une brique générique (calendrier, arrondi, suivi d'une métrique au fil des jours) va dans `<domaine>.utils.ts`. Une métrique qui dépasse quelques lignes y devient une fonction ou un tracker nommé et documenté.
- **Arrondis** : n'arrondir que les valeurs publiées (`round` : 2 décimales pour un montant, 4 pour un cours, 6 pour un ratio ou une quantité). Les cumuls (investi, frais) se font sur les valeurs non arrondies, une seule fois par grandeur.
- **Reproductibilité** : chaque résultat publie sa règle d'exécution (`executionRule`, fixée par l'engine) et la provenance des cours (`dataSource` : source déclarée par le repository, `fetchedAt` lu par le service, empreinte `fingerprintPrices`). Le jeu de référence `engine/backtest.fixture.ts` (cours synthétiques entiers, graine fixe) fige les métriques dans `backtest.engine.test.ts` : un changement de calcul qui les modifie se justifie, puis met à jour les valeurs attendues.
- **Taille du message** : une série journalière ne se duplique pas ; une série parallèle (ex. `lumpSumValue`) est un champ de chaque point de la courbe, pas une seconde courbe avec ses propres dates.
- **services/** orchestre : publie `started`, charge les cours, appelle l'engine, publie `completed`. Toute erreur (données, calcul, publication) → `failed` avec la cause. Seul endroit où l'horloge (`new Date()`) est lue. Ne connaît pas `kafkajs`.
- **consumers/** valide le message avec le schéma de `@trading-plateform/contracts`, appelle **une** méthode de service. Message invalide → `logger.warn` et retour.
- **repositories/** lit les sources externes et normalise leur format (une date de cotation = jour dans le fuseau de la place, `chart.meta.exchangeTimezoneName`, jamais en UTC). Aucun calcul métier.
- **publishers/** publie avec `createKafkaEvent`, clé Kafka = `executionId` (tous les événements d'une exécution sur la même partition).
- Types internes dérivés des contrats (`Pick<BacktestCompletedPayload, ...>`), jamais redéfinis.

Kafka = at-least-once : un `backtest.requested` rejoué republie ses événements ; core-backend les ignore grâce aux transitions gardées.

## Ajouter une métrique ou une feature (checklist)

1. Contrat entrant/sortant → `packages/contracts` (schéma zod, unité commentée).
2. `interfaces/<domaine>.interface.ts` : types dérivés.
3. Calcul → `engine/` + test `bun test`.
4. Sources externes → `repositories/`, événements sortants → `publishers/`, chacun derrière une interface.
5. `services/<domaine>.service.ts` orchestre ; `consumers/` valide et délègue ; câblage dans `index.ts`.
6. Répercute le contrat côté core-backend (colonne, migration, `complete`) dans le même diff.

## Commandes

```bash
bun run index.ts
bun test
bunx tsc --noEmit
```
