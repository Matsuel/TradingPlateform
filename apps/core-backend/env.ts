import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.string().optional(),
    BETTER_AUTH_URL: z.url(),
    // Signe les sessions : trop courte, elle se devine
    BETTER_AUTH_SECRET: z.string().min(32),
    // Partagée avec market-service : prouve que l'appel passe par le proxy de core-backend
    INTERNAL_API_KEY: z.string().min(16),
    PORT: z.coerce.number().int().default(8000),
    WEB_URL: z.url().default("http://localhost:3000"),
    MARKET_SERVICE_URL: z.url().default("http://localhost:8001"),
});

const _env = envSchema.parse(process.env);

export const env = _env;
