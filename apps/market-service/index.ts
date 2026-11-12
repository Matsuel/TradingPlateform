import express from 'express';
import { errorMiddleware } from "@trading-plateform/http";
import internalAuthMiddleware from './middleware/internal-auth.middleware';
import marketRouter from './routes/market';
import { Logger, onShutdown } from '@trading-plateform/utils';
import { env } from './env';

const logger = Logger.here()

const app = express();

app.use(express.json());

// Sonde de disponibilité, sans clé : ne révèle rien
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(internalAuthMiddleware);

app.use(marketRouter);

app.use(errorMiddleware);

const server = app.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT}`);
});

onShutdown(() => new Promise<void>((resolve) => server.close(() => resolve())));
