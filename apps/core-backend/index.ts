import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorMiddleware from './middleware/error.middleware';
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
import { JSON_BODY_LIMIT } from './constants/http.constants';
import { env } from './env';

const logger = Logger.here()

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

    await kafkaClient.ensureTopics(Object.values(BACKTEST_TOPICS));
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe(BACKTEST_TOPICS.started);
    await consumer.subscribe(BACKTEST_TOPICS.completed);
    await consumer.subscribe(BACKTEST_TOPICS.failed);
    await consumer.consume(new BacktestConsumer().handle);

    const server = app.listen(env.PORT, () => logger.info(`Server is running on port ${env.PORT}`));

    onShutdown(() => new Promise<void>((resolve) => server.close(() => resolve())));
    onShutdown(() => consumer.disconnect());
    onShutdown(() => producer.disconnect());
}

main().catch((error) => {
    logger.error('Failed to start core-backend', error);
    process.exitCode = 1;
});
