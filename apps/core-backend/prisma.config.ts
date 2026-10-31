import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, env } from "prisma/config";

// La CLI Prisma tourne sous Node : Bun ne lui charge pas .env, d'où le chargement natif (sans dotenv, Node ≥ 20.12).
// Chemin relatif à ce fichier : la CLI peut être lancée depuis la racine du dépôt (--config)
const envFile = join(import.meta.dirname, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
