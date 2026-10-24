-- CreateEnum
CREATE TYPE "BacktestStatus" AS ENUM ('DRAFT', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvestmentMode" AS ENUM ('LUMP_SUM', 'RECURRING');

-- CreateEnum
CREATE TYPE "InvestmentFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "Backtest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "capital" DECIMAL(18,2) NOT NULL,
    "recurringAmount" DECIMAL(18,2),
    "investmentMode" "InvestmentMode" NOT NULL,
    "investmentFrequency" "InvestmentFrequency",
    "status" "BacktestStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Backtest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacktestAsset" (
    "id" TEXT NOT NULL,
    "backtestId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "weight" DECIMAL(7,4) NOT NULL,

    CONSTRAINT "BacktestAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacktestResult" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "finalValue" DECIMAL(18,2),
    "totalReturn" DECIMAL(12,6),
    "annualizedReturn" DECIMAL(12,6),
    "maxDrawdown" DECIMAL(12,6),
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "metrics" JSONB,
    "equityCurve" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacktestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Backtest_userId_createdAt_idx" ON "Backtest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Backtest_status_idx" ON "Backtest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BacktestAsset_backtestId_symbol_key" ON "BacktestAsset"("backtestId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "BacktestResult_executionId_key" ON "BacktestResult"("executionId");

-- AddForeignKey
ALTER TABLE "Backtest" ADD CONSTRAINT "Backtest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacktestAsset" ADD CONSTRAINT "BacktestAsset_backtestId_fkey" FOREIGN KEY ("backtestId") REFERENCES "Backtest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
