-- AlterTable
ALTER TABLE "Backtest" ADD COLUMN     "batchId" TEXT;

-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "rollingSummary" JSONB;

-- CreateIndex
CREATE INDEX "Backtest_batchId_idx" ON "Backtest"("batchId");
