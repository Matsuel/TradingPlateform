-- CreateEnum
CREATE TYPE "ExecutionRule" AS ENUM ('CLOSE_ON_SCHEDULED_DAY');

-- AlterTable
ALTER TABLE "BacktestResult" ADD COLUMN     "dataSource" JSONB,
ADD COLUMN     "executionRule" "ExecutionRule";
