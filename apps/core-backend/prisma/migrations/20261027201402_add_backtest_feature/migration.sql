/*
  Warnings:

  - You are about to drop the column `symbol` on the `Backtest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Backtest" DROP COLUMN "symbol",
ADD COLUMN     "symbols" TEXT[];
