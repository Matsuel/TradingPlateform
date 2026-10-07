import express from 'express';
import cors from 'cors';
import { Logger } from './utils/logger';
import errorMiddleware from './middleware/error.middleware';
import { dbHealthCheck } from './utils/db';
import authRouter from './routes/auth';

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
app.use(errorMiddleware)

app.listen(8000, async () => {
    await dbHealthCheck();
    logger.info('Server is running on port 8000');
});