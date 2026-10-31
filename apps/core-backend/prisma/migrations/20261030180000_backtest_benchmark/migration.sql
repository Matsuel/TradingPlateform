-- AlterTable
ALTER TABLE "Backtest" ADD COLUMN     "benchmarkSymbol" TEXT;

-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "benchmark" JSONB;
