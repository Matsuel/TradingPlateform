import { Logger } from './logger'

const logger = Logger.here()

const cleanups: Array<() => Promise<void> | void> = []
let registered = false

/**
 * Enregistre une étape d'arrêt propre (fermer le serveur, déconnecter Kafka) exécutée à `SIGTERM` ou `SIGINT`.
 * Les étapes tournent dans l'ordre d'enregistrement ; une étape qui échoue est loggée sans bloquer les suivantes.
 */
export function onShutdown(cleanup: () => Promise<void> | void): void {
    cleanups.push(cleanup)
    if (registered) return
    registered = true

    const stop = async (signal: string) => {
        logger.info(`${signal} received, shutting down`)
        for (const step of cleanups) {
            try {
                await step()
            } catch (error) {
                logger.error('Shutdown step failed', { error: error instanceof Error ? error.message : String(error) })
            }
        }
        process.exit(0)
    }
    process.once('SIGTERM', () => void stop('SIGTERM'))
    process.once('SIGINT', () => void stop('SIGINT'))
}
