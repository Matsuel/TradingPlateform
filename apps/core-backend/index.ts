import express from 'express';
import cors from 'cors';
import { Logger } from './utils/logger';

const logger = Logger.here()

const app = express();

app.use(cors());

app.listen(8000, () => {
    logger.info('Server is running on port 8000');
});