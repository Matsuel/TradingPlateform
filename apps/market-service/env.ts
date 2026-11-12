import { z } from 'zod';

const envSchema = z.object({
    LOGO_DEV_TOKEN: z.string().optional(),
    // Partagée avec core-backend : seul son proxy peut appeler ce service
    INTERNAL_API_KEY: z.string().min(16),
    PORT: z.coerce.number().int().default(8001),
});

const _env = envSchema.parse(process.env);

export const env = _env;
