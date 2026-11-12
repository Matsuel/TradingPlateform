import { z } from "zod";

const envSchema = z.object({
    // market-service : seule source de cours (aucun appel direct à un fournisseur)
    MARKET_SERVICE_URL: z.url().default("http://localhost:8001"),
    // Partagée avec market-service : prouve que l'appel vient d'un service du système
    INTERNAL_API_KEY: z.string().min(16),
});

export const env = envSchema.parse(process.env);
