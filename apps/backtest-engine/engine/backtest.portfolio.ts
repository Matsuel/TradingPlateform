import type { Trade, TradeSide } from "@trading-plateform/contracts";
import type { BacktestParams, PriceSeries } from "../interfaces/backtest.interface";
import { round } from "./backtest.utils";

// Écart minimal à la cible, devise saisie, pour passer un ordre de rebalancement : un ordre arrondi à 0 € serait invalide (amount > 0)
const MIN_REBALANCE_ORDER = 0.01;

/**
 * Portefeuille simulé : lignes, derniers cours connus, ordres et frais. Les règles d'exécution (achat réparti selon
 * `weight`, frais `amount × feeRate`, rebalancement par vente des lignes surpondérées) sont décrites sur `simulate`.
 * Les montants sont dans la devise saisie ; les cumuls (`fees`) ne sont pas arrondis, seules les valeurs publiées le sont.
 */
export function createPortfolio({ allocations, feeRate }: Pick<BacktestParams, "allocations" | "feeRate">, prices: PriceSeries) {
    const symbols = allocations.map((allocation) => allocation.symbol);
    // Prochain cours non lu de chaque symbole (séries triées par date)
    const cursors = new Map<string, number>(symbols.map((symbol) => [symbol, 0]));
    const lastClose = new Map<string, number>();
    const shares = new Map<string, number>(symbols.map((symbol) => [symbol, 0]));
    const trades: Trade[] = [];
    let fees = 0;

    const lineValue = (symbol: string) => shares.get(symbol)! * lastClose.get(symbol)!;
    const value = () => symbols.reduce((sum, symbol) => sum + lineValue(symbol), 0);

    /** Exécute un ordre au dernier cours connu et renvoie le montant net de frais (investi pour un achat, encaissé pour une vente). */
    const placeOrder = (date: string, symbol: string, side: TradeSide, amount: number) => {
        const fee = amount * feeRate;
        const price = lastClose.get(symbol)!;
        const quantity = side === "BUY" ? (amount - fee) / price : amount / price;
        shares.set(symbol, shares.get(symbol)! + (side === "BUY" ? quantity : -quantity));
        fees += fee;
        trades.push({
            date,
            symbol,
            side,
            price: round(price, 4),
            quantity: round(quantity, 6),
            amount: round(amount, 2),
            fee: round(fee, 2),
        });
        return amount - fee;
    };

    return {
        trades,
        /** Valeur de marché du portefeuille aux derniers cours lus. */
        value,
        /** Total des frais prélevés depuis le début, non arrondi. */
        get fees() {
            return fees;
        },
        /** Lit les cours jusqu'à `date` (inclus) ; un symbole sans cours ce jour garde son dernier cours connu. */
        advance(date: string) {
            for (const symbol of symbols) {
                const series = prices[symbol]!;
                let cursor = cursors.get(symbol)!;
                while (cursor < series.length && series[cursor]!.date <= date) lastClose.set(symbol, series[cursor++]!.close);
                cursors.set(symbol, cursor);
            }
        },
        /** Investit `contribution` (frais compris) selon les `weight` de l'allocation. */
        invest(date: string, contribution: number) {
            for (const { symbol, weight } of allocations) placeOrder(date, symbol, "BUY", contribution * weight);
        },
        /**
         * Ramène chaque ligne à `weight × valeur` : vend les lignes surpondérées, répartit le produit net sur les lignes
         * sous leur cible au prorata de leur écart. Renvoie `false` si aucun ordre n'est nécessaire.
         */
        rebalance(date: string): boolean {
            const total = value();
            // Écart à la cible, devise saisie : > 0 ligne surpondérée, < 0 sous-pondérée
            const gaps = allocations.map(({ symbol, weight }) => ({ symbol, gap: lineValue(symbol) - weight * total }));
            const overweight = gaps.filter(({ gap }) => gap >= MIN_REBALANCE_ORDER);
            const underweight = gaps.filter(({ gap }) => -gap >= MIN_REBALANCE_ORDER);
            if (overweight.length === 0 || underweight.length === 0) return false;

            let proceeds = 0;
            for (const { symbol, gap } of overweight) proceeds += placeOrder(date, symbol, "SELL", gap);
            const shortfall = underweight.reduce((sum, { gap }) => sum - gap, 0);
            for (const { symbol, gap } of underweight) placeOrder(date, symbol, "BUY", (proceeds * -gap) / shortfall);
            return true;
        },
        /** Position finale de chaque ligne, quantité et valeur arrondies. */
        holdings: () =>
            symbols.map((symbol) => ({
                symbol,
                quantity: round(shares.get(symbol)!, 6),
                value: round(lineValue(symbol), 2),
            })),
    };
}
