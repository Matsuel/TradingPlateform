import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// La CLI Prisma tourne sous Node : Bun ne lui charge pas .env, d'où le chargement natif (sans dotenv)
if (existsSync(".env")) process.loadEnvFile(".env");

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
