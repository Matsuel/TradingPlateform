-- fxContribution (ajoutée par la migration précédente, jamais publiée) est remplacée par returnBreakdown.fx :
-- la valeur ne peut pas être reconstituée pour les résultats déjà calculés, qui n'ont pas la décomposition.
-- AlterTable
ALTER TABLE "BacktestResult" DROP COLUMN "fxContribution",
ADD COLUMN     "dividendGain" DECIMAL(18,2),
ADD COLUMN     "dividendEvents" JSONB,
ADD COLUMN     "returnBreakdown" JSONB;
