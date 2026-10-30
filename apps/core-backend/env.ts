import { z } from 'zod';

const envSchema = z.object({
    // Optionnelle : sans elle, pg se rabat sur les variables PG* standard
    DATABASE_URL: z.string().optional(),
    NODE_ENV: z.string().optional(),
    BETTER_AUTH_URL: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    WEB_URL: z.url().default("http://localhost:3000"),
    MARKET_SERVICE_URL: z.url().default("http://localhost:8001"),
});

const _env = envSchema.parse(process.env);

export const env = _env;