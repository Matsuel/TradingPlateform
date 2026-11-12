-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "priceReturn" DECIMAL(12,6),
ADD COLUMN     "dividendTotal" DECIMAL(18,2),
ADD COLUMN     "dividendGain" DECIMAL(18,2),
ADD COLUMN     "dividendEvents" JSONB,
ADD COLUMN     "returnBreakdown" JSONB;
