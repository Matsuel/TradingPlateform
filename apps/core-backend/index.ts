import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from "@trading-plateform/http";
import { authRateLimit, backtestCreateRateLimit } from './middleware/rate-limit.middleware';
import { dbHealthCheck, isDbConnected } from './utils/db';
import authRouter from './routes/auth';
import portfolioRouter from './routes/portfolio';
import marketRouter from './routes/market';
import backtestRouter from './routes/backtest';
import { Logger, onShutdown } from '@trading-plateform/utils';
import { BACKTEST_TOPICS } from '@trading-plateform/contracts';
import { consumer, kafkaClient, producer } from './lib/kafka';
import BacktestConsumer from './consumers/backtest.consumer';
import BacktestService from './services/backtest.service';
import { STALE_SWEEP_INTERVAL_MS } from './constants/backtest.constants';
import { JSON_BODY_LIMIT } from './constants/http.constants';
import { env } from './env';

const logger = Logger.here()

const backtestService = new BacktestService();

const app = express();

app.use(helmet());

app.use(cors({
    origin: env.WEB_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

// Sonde de disponibilité : 503 si la base ne répond pas
app.get('/health', async (_req, res) => {
    const ok = await isDbConnected();
    res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'unavailable' });
});

app.use('/api/auth', authRateLimit);
app.use(authRouter);

// Routes proxifiées vers les microservices : avant express.json() pour garder le body intact.
app.use(marketRouter);

app.use(express.json({ limit: JSON_BODY_LIMIT }));

app.use(portfolioRouter);

app.use('/api/backtest', backtestCreateRateLimit);
app.use(backtestRouter);

app.use(errorMiddleware);

async function main(): Promise<void> {
    await dbHealthCheck();

    // L'API écoute avant Kafka : l'entrée dans le groupe du consumer peut durer des dizaines de secondes après un redémarrage
    // (l'ancien membre doit expirer) et le web ne doit pas tomber en `fetch failed` pendant ce temps.
    const server = app.listen(env.PORT, () => logger.info(`Server is running on port ${env.PORT}`));
    onShutdown(() => new Promise<void>((resolve) => server.close(() => resolve())));

    await kafkaClient.ensureTopics(Object.values(BACKTEST_TOPICS));
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe(BACKTEST_TOPICS.started);
    await consumer.subscribe(BACKTEST_TOPICS.completed);
    await consumer.subscribe(BACKTEST_TOPICS.failed);
    await consumer.consume(new BacktestConsumer().handle);
    onShutdown(() => consumer.disconnect());
    onShutdown(() => producer.disconnect());

    // Une exécution que l'engine n'a jamais terminée ne doit pas bloquer son backtest
    const sweeper = setInterval(() => {
        backtestService.failStaleExecutions().catch((error) => logger.error('Stale sweep failed', { error: String(error) }));
    }, STALE_SWEEP_INTERVAL_MS);
    onShutdown(() => clearInterval(sweeper));
}

// Sans Kafka le backtest ne fonctionne pas : on s'arrête franchement (le serveur et les connexions gardent sinon le process en vie)
main().catch((error) => {
    logger.error('Failed to start core-backend', error);
    process.exit(1);
});
