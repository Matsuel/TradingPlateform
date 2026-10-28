import { Logger } from "@trading-plateform/utils";
import { prisma } from "../prisma";

const logger = Logger.here()

export const dbHealthCheck = async () => {
    try {
        // Lecture minimale via Prisma pour vérifier que la base de données répond
        await prisma.user.findFirst({ select: { id: true } });
        logger.info("🔌 Database connection successful, API can start...");
    } catch (_error) {
        logger.error("⚠️ Database connection failed, API cannot start exiting...");
        process.exit(1);
    }
}

export const isDbConnected = async (): Promise<boolean> => {
    try {
        await prisma.user.findFirst({ select: { id: true } });
        return true;
    } catch (_error) {
        logger.error("⚠️ Database connection failed");
        return false;
    }
}