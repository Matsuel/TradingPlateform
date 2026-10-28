-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "maxDrawdown" DECIMAL(12,6),
ADD COLUMN     "maxDrawdownDate" TIMESTAMP(3),
ADD COLUMN     "trades" JSONB NOT NULL DEFAULT '[]';
