import express from 'express';
import cors from 'cors';
import errorMiddleware from './middleware/error.middleware';
import { dbHealthCheck } from './utils/db';
import authRouter from './routes/auth';
import portfolioRouter from './routes/portfolio';
import marketRouter from './routes/market';
import backtestRouter from './routes/backtest';
import { Logger } from '@trading-plateform/utils';

const logger = Logger.here()

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(authRouter);

app.use(express.json());

app.use(portfolioRouter);

app.use(errorMiddleware);

app.use(marketRouter);

app.use(backtestRouter)

app.listen(8000, async () => {
    await dbHealthCheck();
    logger.info('Server is running on port 8000');
});