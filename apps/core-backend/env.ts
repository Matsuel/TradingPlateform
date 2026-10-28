import { z } from 'zod';

const envSchema = z.object({
    MARKET_SERVICE_URL: z.url().default("http://localhost:8001"),
});

const _env = envSchema.parse(process.env);

export const env = _env;