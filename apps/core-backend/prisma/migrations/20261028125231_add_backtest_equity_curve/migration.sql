-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "equityCurve" JSONB NOT NULL DEFAULT '[]';
