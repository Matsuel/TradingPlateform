# @trading-plateform/kafka

Wrappers `kafkajs` génériques : `KafkaClient` (dont `ensureTopics`), `KafkaProducer`, `KafkaConsumer`, `kafkaConfig`, `createKafkaEvent`, types `KafkaEvent<T>` / `KafkaMessage<T>`. Les événements métier (topic + schéma zod) vivent dans `packages/contracts`, pas ici.

- Un fichier par classe : `kafka.<nom>.ts`, config dans `config/`, tout réexporté par `src/index.ts`.
- Pas de logique métier d'une app ici.
- Respecte `../../AGENTS.md`.

## Ajouter un événement / un topic

1. Contrat dans `packages/contracts` : constante de topic `domaine.action` + schéma zod de l'enveloppe (`version: 1`).
2. Producteur : `producer.publish(TOPIC, { key, value: createKafkaEvent(TOPIC, payload) })`.
3. Consommateur : `client.ensureTopics([...])` avant `subscribe`, puis validation zod du message reçu.
4. Utiliser `KafkaProducer`/`KafkaConsumer` existants ; ne pas créer de wrapper par app.
5. Changement de payload = rétrocompatible ou nouvelle `version` ; vérifier core-backend et backtest-engine.
