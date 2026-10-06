import { prisma } from "../prisma";
import { Logger } from "./logger";

const logger = Logger.here()

export const dbHealthCheck = async () => {
    try {
        // Requête de test simple pour vérifier que la base de données répond
        await prisma.$queryRaw`SELECT 1`;
        logger.info("🔌 Database connection successful, API can start...");
    } catch (_error) {
        logger.error("⚠️ Database connection failed, API cannot start exiting...");
        process.exit(1);
    }
}

export const isDbConnected = async (): Promise<boolean> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (_error) {
        logger.error("⚠️ Database connection failed");
        return false;
    }
}