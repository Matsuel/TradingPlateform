/*
  Warnings:

  - You are about to drop the column `capital` on the `Backtest` table. All the data in the column will be lost.
  - You are about to drop the column `feePercent` on the `Backtest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Backtest` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `BacktestExecution` table. All the data in the column will be lost.
  - You are about to drop the column `configSnapshot` on the `BacktestExecution` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `BacktestExecution` table. All the data in the column will be lost.
  - You are about to drop the column `dataSnapshot` on the `BacktestExecution` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `BacktestExecution` table. All the data in the column will be lost.
  - You are about to drop the column `annualizedReturn` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `equityCurve` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `maxDrawdown` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `metrics` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `profitLoss` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalFees` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalInvested` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalUnits` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the column `valuationDate` on the `BacktestResult` table. All the data in the column will be lost.
  - You are about to drop the `BacktestAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BacktestTransaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `initialAmount` to the `Backtest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `Backtest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BacktestAsset" DROP CONSTRAINT "BacktestAsset_backtestId_fkey";

-- DropForeignKey
ALTER TABLE "BacktestTransaction" DROP CONSTRAINT "BacktestTransaction_executionId_fkey";

-- DropIndex
DROP INDEX "Backtest_status_idx";

-- DropIndex
DROP INDEX "BacktestExecution_status_createdAt_idx";

-- AlterTable
ALTER TABLE "Backtest" DROP COLUMN "capital",
DROP COLUMN "feePercent",
DROP COLUMN "status",
ADD COLUMN     "feeRate" DECIMAL(8,6) NOT NULL DEFAULT 0,
ADD COLUMN     "initialAmount" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "symbol" TEXT NOT NULL,
ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "endDate" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BacktestExecution" DROP COLUMN "completedAt",
DROP COLUMN "configSnapshot",
DROP COLUMN "currency",
DROP COLUMN "dataSnapshot",
DROP COLUMN "errorMessage",
ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "finishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BacktestResult" DROP COLUMN "annualizedReturn",
DROP COLUMN "equityCurve",
DROP COLUMN "maxDrawdown",
DROP COLUMN "metrics",
DROP COLUMN "profitLoss",
DROP COLUMN "totalFees",
DROP COLUMN "totalInvested",
DROP COLUMN "totalUnits",
DROP COLUMN "valuationDate";

-- DropTable
DROP TABLE "BacktestAsset";

-- DropTable
DROP TABLE "BacktestTransaction";

-- CreateIndex
CREATE INDEX "BacktestExecution_status_idx" ON "BacktestExecution"("status");
