# @trading-plateform/kafka

Wrappers `kafkajs` : `KafkaClient`, `KafkaProducer`, `KafkaConsumer`, `kafkaConfig`, types d'événements (`KafkaEvent<T>`, `KafkaMessage<T>`, `BacktestCompletedEvent`).

- Un fichier par classe : `kafka.<nom>.ts`, config dans `config/`, tout réexporté par `src/index.ts`.
- Un nouvel événement = un type dans `kafka.types.ts` avec l'enveloppe `KafkaEvent` (`eventType` littéral `domaine.action`, `version`).
- Pas de logique métier d'une app ici.
- Respecte `../../AGENTS.md`.

## Ajouter un événement / un topic

1. Type du payload + événement dans `src/kafka.types.ts` (enveloppe `KafkaEvent`, `eventType` littéral `domaine.action`, `version: 1`).
2. Exporter le type depuis `src/index.ts`.
3. Utiliser `KafkaProducer`/`KafkaConsumer` existants ; ne pas créer de wrapper par app.
4. Schéma zod correspondant dans `packages/contracts`.
5. Changement de payload = rétrocompatible ou nouvelle `version` ; vérifier core-backend et backtest-engine.
