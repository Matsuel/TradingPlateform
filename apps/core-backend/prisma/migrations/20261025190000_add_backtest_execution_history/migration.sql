-- Keep existing saved configurations readable while making dates mandatory for new backtests.
ALTER TABLE "Backtest"
    ADD COLUMN "startDate" DATE,
    ADD COLUMN "endDate" DATE,
    ADD COLUMN "feePercent" DECIMAL(7,4) NOT NULL DEFAULT 0;

UPDATE "Backtest"
SET "startDate" = ("createdAt" - INTERVAL '1 year')::date,
    "endDate" = "createdAt"::date;

ALTER TABLE "Backtest"
    ALTER COLUMN "startDate" SET NOT NULL,
    ALTER COLUMN "endDate" SET NOT NULL;

ALTER TABLE "BacktestResult"
    ADD COLUMN "totalInvested" DECIMAL(18,2),
    ADD COLUMN "totalFees" DECIMAL(18,2),
    ADD COLUMN "profitLoss" DECIMAL(18,2),
    ADD COLUMN "totalUnits" DECIMAL(24,8),
    ADD COLUMN "valuationDate" DATE;

CREATE TABLE "BacktestExecution" (
    "id" TEXT NOT NULL,
    "backtestId" TEXT NOT NULL,
    "status" "BacktestStatus" NOT NULL DEFAULT 'PENDING',
    "currency" TEXT,
    "configSnapshot" JSONB NOT NULL,
    "dataSnapshot" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "BacktestExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BacktestTransaction" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "executedAt" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "fee" DECIMAL(18,2) NOT NULL,
    "price" DECIMAL(20,8) NOT NULL,
    "units" DECIMAL(24,8) NOT NULL,
    CONSTRAINT "BacktestTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BacktestExecution_backtestId_createdAt_idx" ON "BacktestExecution"("backtestId", "createdAt");
CREATE INDEX "BacktestExecution_status_createdAt_idx" ON "BacktestExecution"("status", "createdAt");
CREATE INDEX "BacktestTransaction_executionId_executedAt_idx" ON "BacktestTransaction"("executionId", "executedAt");

ALTER TABLE "BacktestExecution"
    ADD CONSTRAINT "BacktestExecution_backtestId_fkey"
    FOREIGN KEY ("backtestId") REFERENCES "Backtest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BacktestTransaction"
    ADD CONSTRAINT "BacktestTransaction_executionId_fkey"
    FOREIGN KEY ("executionId") REFERENCES "BacktestExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing results may predate the execution-history table; enforce the relation for new rows.
ALTER TABLE "BacktestResult"
    ADD CONSTRAINT "BacktestResult_executionId_fkey"
    FOREIGN KEY ("executionId") REFERENCES "BacktestExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE
    NOT VALID;
