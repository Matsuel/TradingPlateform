-- CreateTable
CREATE TABLE "BacktestAllocation" (
    "id" TEXT NOT NULL,
    "backtestId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "weight" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "BacktestAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BacktestAllocation_backtestId_symbol_key" ON "BacktestAllocation"("backtestId", "symbol");

-- AddForeignKey
ALTER TABLE "BacktestAllocation" ADD CONSTRAINT "BacktestAllocation_backtestId_fkey" FOREIGN KEY ("backtestId") REFERENCES "Backtest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill : poids égaux au pourcent entier (D2), même règle que equalWeightAllocations du service :
-- floor(100 / n) % chacun, le reste réparti +1 % sur les premiers symboles dans l'ordre du tableau (somme = 1).
-- L'id est un cuid généré par Prisma côté client : en SQL, un UUID texte (gen_random_uuid, PostgreSQL 13+) le remplace.
INSERT INTO "BacktestAllocation" ("id", "backtestId", "symbol", "weight")
SELECT
    gen_random_uuid()::text,
    b.id,
    s.symbol,
    (100 / cardinality(b.symbols) + CASE WHEN s.position <= 100 % cardinality(b.symbols) THEN 1 ELSE 0 END) / 100.0
FROM "Backtest" b
CROSS JOIN LATERAL unnest(b.symbols) WITH ORDINALITY AS s(symbol, position);

-- AlterTable
ALTER TABLE "Backtest" DROP COLUMN "symbols";
