-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "totalInvested" DECIMAL(18,2);

-- CreateIndex
CREATE UNIQUE INDEX "BacktestExecution_backtestId_attempt_key" ON "BacktestExecution"("backtestId", "attempt");
