-- AlterTable
ALTER TABLE "Backtest" ADD COLUMN     "latestExecutionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Backtest_latestExecutionId_key" ON "Backtest"("latestExecutionId");

-- AddForeignKey
ALTER TABLE "Backtest" ADD CONSTRAINT "Backtest_latestExecutionId_fkey" FOREIGN KEY ("latestExecutionId") REFERENCES "BacktestExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill : dernière exécution existante de chaque backtest (même ordre que le code : createdAt puis attempt)
UPDATE "Backtest" b
SET "latestExecutionId" = (
    SELECT e.id FROM "BacktestExecution" e
    WHERE e."backtestId" = b.id
    ORDER BY e."createdAt" DESC, e.attempt DESC
    LIMIT 1
);
