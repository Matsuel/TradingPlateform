import express from 'express';
import cors from 'cors';
import { Logger } from './utils/logger';
import errorMiddleware from './middleware/error.middleware';

const logger = Logger.here()

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorMiddleware)

app.listen(8000, () => {
    logger.info('Server is running on port 8000');
});