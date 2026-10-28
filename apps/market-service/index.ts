import express from 'express';
import errorMiddleware from './middleware/error.middleware';
import marketRouter from './routes/market';
import { Logger } from '@trading-plateform/utils';

const logger = Logger.here()

const app = express();

app.use(express.json());

app.use(marketRouter);

app.use(errorMiddleware);

app.listen(8001, () => {
    logger.info('Server is running on port 8001');
});
