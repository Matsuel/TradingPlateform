import { logLevel, type LogEntry } from "kafkajs";
import { createLogger } from "@azimut/utils";

const logger = createLogger("kafkajs");

/**
 * `logCreator` de kafkajs : ses journaux passent par le `Logger` partagé (`[date] LEVEL kafkajs:<Composant> message {données}`),
 * comme ceux des apps. Niveaux : ERROR → error, WARN → warn, INFO → info, DEBUG → debug ; le seuil retenu est celui de `Logger`
 * (`LOG_LEVEL`), kafkajs ne filtre que ce qu'il ne produit pas (`logLevel` du client).
 */
export const kafkaLogCreator = () => ({ namespace, level, log }: LogEntry) => {
    // `logger` (nom du logger kafkajs) et `timestamp` sont déjà portés par le format du Logger
    const { message, timestamp: _timestamp, logger: _logger, ...data } = log;
    // Certains journaux (avertissement du partitionneur) n'ont pas de composant
    const target = namespace ? logger.child(namespace) : logger;
    const args = Object.keys(data).length > 0 ? [message, data] : [message];

    switch (level) {
        case logLevel.ERROR:
            return target.error(...args);
        case logLevel.WARN:
            return target.warn(...args);
        case logLevel.INFO:
            return target.info(...args);
        default:
            return target.debug(...args);
    }
};
