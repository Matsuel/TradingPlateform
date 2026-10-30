-- CreateEnum
CREATE TYPE "RebalanceFrequency" AS ENUM ('NONE', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Backtest" ADD COLUMN     "rebalanceFrequency" "RebalanceFrequency" NOT NULL DEFAULT 'NONE';
