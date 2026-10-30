# @trading-plateform/kafka

Wrappers `kafkajs` génériques : `KafkaClient` (dont `ensureTopics`), `KafkaProducer`, `KafkaConsumer`, `kafkaConfig`, `createKafkaEvent`, types `KafkaEvent<T>` / `KafkaMessage<T>` / `MessageHandler<T>`. Aucune logique métier : les événements (topic + schéma zod) vivent dans `packages/contracts`. Respecte `../../AGENTS.md`.

- Un fichier par classe ou sujet : `src/kafka.<nom>.ts`, config dans `src/config/`, tout réexporté par `src/index.ts`.
- `KafkaConsumer.consume` écarte (log `warn`) un message vide ou non-JSON ; le handler reçoit un objet à valider avec zod, typé `unknown` côté app.
- `ensureTopics` ne crée que les topics manquants.
- `KafkaProducer.publish` compresse en GZIP : la limite du broker (~1 Mo par message) porte sur le message compressé. Un payload qui approche cette limite se réduit dans son contrat (pas de série dupliquée), pas en relevant la limite.
- Les apps utilisent ces classes telles quelles ; pas de wrapper Kafka par app.

## Publier / consommer un événement

1. Contrat dans `packages/contracts` (topic + schéma).
2. Producteur : `producer.publish(TOPIC, { key, value: createKafkaEvent(TOPIC, payload) })`, `key` = identifiant de l'agrégat (ex. `executionId`) pour garder l'ordre de ses événements.
3. Consommateur : `client.ensureTopics([...])` avant `subscribe`, un handler `MessageHandler<unknown>` qui valide avec le schéma du contrat.
