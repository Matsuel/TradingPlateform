import { z } from 'zod';

const envSchema = z.object({
    LOGO_DEV_TOKEN: z.string().optional(),
});

const _env = envSchema.parse(process.env);

export const env = _env;