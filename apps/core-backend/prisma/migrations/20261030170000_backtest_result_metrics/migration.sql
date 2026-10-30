-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "cagr" DECIMAL(12,6),
ADD COLUMN     "maxDrawdownPeakDate" TIMESTAMP(3),
ADD COLUMN     "maxDrawdownRecoveryDate" TIMESTAMP(3),
ADD COLUMN     "recoveryDays" INTEGER,
ADD COLUMN     "sharpeRatio" DECIMAL(12,6),
ADD COLUMN     "volatility" DECIMAL(12,6);
