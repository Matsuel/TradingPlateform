-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "holdings" JSONB NOT NULL DEFAULT '[]';
