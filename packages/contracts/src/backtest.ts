import { z } from "zod";
import { kafkaEventSchema } from "./event";

export const BACKTEST_TOPICS = {
    requested: "backtest.requested",
    started: "backtest.started",
    completed: "backtest.completed",
    failed: "backtest.failed",
} as const;

// Statuts d'une exécution, recopie de l'enum Prisma `BacktestStatus` : core-backend vérifie à la compilation qu'ils restent égaux
export const BACKTEST_STATUSES = ["DRAFT", "PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"] as const;

// Réponse de GET /api/backtest/stats : backtests comptés selon le statut de leur dernière exécution
export interface BacktestStats {
    total: number;
    active: number;
    completed: number;
    failed: number;
    // Ratios : completed / total et failed / total, 0 si total = 0
    completedRate: number;
    failedRate: number;
}

// Écart toléré sur la somme des poids et sur leur précision au pourcent : absorbe les erreurs d'arrondi flottant
export const ALLOCATION_WEIGHT_TOLERANCE = 1e-6;

export const allocationSchema = z.object({
    symbol: z.string().min(1),
    // Ratio : 0.6 = 60 % du portefeuille, au pourcent près (multiple de 0.01)
    weight: z.number().gt(0).max(1),
});

export const allocationsSchema = z
    .array(allocationSchema)
    .min(1)
    .refine((allocations) => new Set(allocations.map((a) => a.symbol)).size === allocations.length, {
        message: "Symbols must be unique",
    })
    .refine(
        (allocations) => allocations.every((a) => Math.abs(a.weight * 100 - Math.round(a.weight * 100)) < ALLOCATION_WEIGHT_TOLERANCE),
        { message: "Weights must be whole percents" },
    )
    .refine((allocations) => Math.abs(allocations.reduce((sum, a) => sum + a.weight, 0) - 1) < ALLOCATION_WEIGHT_TOLERANCE, {
        message: "Weights must sum to 1",
    });

// Rebalancement vers les poids cibles au premier jour de cotation de chaque période, à la clôture (D7)
export const REBALANCE_FREQUENCIES = ["NONE", "MONTHLY", "QUARTERLY", "YEARLY"] as const;

export const TRADE_SIDES = ["BUY", "SELL"] as const;

export const backtestRequestedPayloadSchema = z.object({
    executionId: z.string().min(1),
    backtestId: z.string().min(1),
    userId: z.string().min(1),
    allocations: allocationsSchema,
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
    investmentMode: z.enum(["LUMP_SUM", "RECURRING"]),
    initialAmount: z.number().min(0),
    recurringAmount: z.number().positive().nullable(),
    investmentFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).nullable(),
    rebalanceFrequency: z.enum(REBALANCE_FREQUENCIES),
    // Ratio : 0.001 = 0,1 % par ordre, achat ou vente (D8)
    feeRate: z.number().min(0).max(1),
});

// Règle d'exécution d'un achat simulé. MVP : décisions planifiées (versement DCA), connues à l'avance,
// exécutées à la clôture du jour de cotation de l'échéance ; une décision fondée sur un cours s'exécutera en T+1
export const EXECUTION_RULES = ["CLOSE_ON_SCHEDULED_DAY"] as const;

// Provenance des cours utilisés par une exécution : rend le résultat explicable et comparable
export const dataSourceSchema = z.object({
    provider: z.enum(["yahoo-finance2"]),
    // Clôture journalière ajustée des splits, pas des dividendes
    priceType: z.enum(["CLOSE_SPLIT_ADJUSTED"]),
    // Instant de récupération des cours
    fetchedAt: z.iso.datetime(),
    // SHA-256 hexadécimal des séries de cours : même empreinte = mêmes données d'entrée
    fingerprint: z.string().regex(/^[0-9a-f]{64}$/),
});

export const backtestStartedPayloadSchema = z.object({
    executionId: z.string().min(1),
    startedAt: z.iso.datetime(),
});

export const equityPointSchema = z.object({
    date: z.iso.date(),
    // Valeur du portefeuille à la clôture, devise saisie
    value: z.number(),
    // Total versé à cette date, frais compris, devise saisie
    invested: z.number(),
    // Valeur du même total investi en une fois au premier jour (DCA uniquement), devise saisie
    lumpSumValue: z.number().optional(),
});

// Montants d'un ordre arrondis au centime ; les totaux du résultat sont calculés sur les valeurs non arrondies
export const tradeSchema = z.object({
    date: z.iso.date(),
    symbol: z.string().min(1),
    // Sens de l'ordre : quantité et montant restent positifs, le sens porte le signe
    side: z.enum(TRADE_SIDES),
    // Cours d'exécution (clôture du jour), devise saisie
    price: z.number().positive(),
    // Nombre de titres achetés ou vendus (fractionnaire) : BUY = (amount − fee) / price, SELL = amount / price
    quantity: z.number().positive(),
    // Devise saisie. BUY : montant payé, frais compris. SELL : produit brut (quantity × price), encaissé net de fee
    amount: z.number().positive(),
    // Frais de l'ordre, amount × feeRate (D8), devise saisie
    fee: z.number().min(0),
});

export const holdingSchema = z.object({
    symbol: z.string().min(1),
    // Titres détenus en fin de simulation (fractionnaire)
    quantity: z.number().min(0),
    // Valeur au dernier cours connu, devise saisie
    value: z.number().min(0),
});

// Métriques du même total versé investi en une fois au premier jour, mêmes frais (courbe : lumpSumValue)
export const lumpSumComparisonSchema = z.object({
    finalValue: z.number(),
    // Ratio
    totalReturn: z.number(),
    // Ratio ≤ 0
    maxDrawdown: z.number().max(0),
    // Valeur finale DCA − valeur finale investissement unique, devise saisie : > 0 si le DCA fait mieux
    dcaAdvantage: z.number(),
});

export const backtestCompletedPayloadSchema = z.object({
    executionId: z.string().min(1),
    finishedAt: z.iso.datetime(),
    finalValue: z.number(),
    // Total versé, frais compris
    totalInvested: z.number().positive(),
    // Somme des frais prélevés sur les achats et les ventes (D8), devise saisie : déduits de la valeur du portefeuille,
    // totalInvested reste la somme des versements
    totalFees: z.number().min(0),
    // Plus-value : valeur finale − total versé, devise saisie
    profit: z.number(),
    // Ratio : profit / totalInvested
    totalReturn: z.number(),
    totalTrades: z.number().int().min(0),
    // Ratio ≤ 0, mesuré hors versements (performance pondérée dans le temps)
    maxDrawdown: z.number().max(0),
    maxDrawdownDate: z.iso.date().nullable(),
    equityCurve: z.array(equityPointSchema),
    trades: z.array(tradeSchema),
    holdings: z.array(holdingSchema),
    // null hors DCA : comparer un investissement unique à lui-même n'apporte rien
    lumpSumComparison: lumpSumComparisonSchema.nullable(),
    executionRule: z.enum(EXECUTION_RULES),
    dataSource: dataSourceSchema,
});

export const backtestFailedPayloadSchema = z.object({
    executionId: z.string().min(1),
    finishedAt: z.iso.datetime(),
    error: z.string(),
});

export const backtestRequestedEventSchema = kafkaEventSchema(backtestRequestedPayloadSchema);
export const backtestStartedEventSchema = kafkaEventSchema(backtestStartedPayloadSchema);
export const backtestCompletedEventSchema = kafkaEventSchema(backtestCompletedPayloadSchema);
export const backtestFailedEventSchema = kafkaEventSchema(backtestFailedPayloadSchema);

export type BacktestStatus = (typeof BACKTEST_STATUSES)[number];
export type Allocation = z.infer<typeof allocationSchema>;
export type BacktestRequestedPayload = z.infer<typeof backtestRequestedPayloadSchema>;
export type BacktestStartedPayload = z.infer<typeof backtestStartedPayloadSchema>;
export type EquityPoint = z.infer<typeof equityPointSchema>;
export type RebalanceFrequency = (typeof REBALANCE_FREQUENCIES)[number];
export type TradeSide = (typeof TRADE_SIDES)[number];
export type Trade = z.infer<typeof tradeSchema>;
export type Holding = z.infer<typeof holdingSchema>;
export type LumpSumComparison = z.infer<typeof lumpSumComparisonSchema>;
export type ExecutionRule = (typeof EXECUTION_RULES)[number];
export type DataSource = z.infer<typeof dataSourceSchema>;
export type BacktestCompletedPayload = z.infer<typeof backtestCompletedPayloadSchema>;
export type BacktestFailedPayload = z.infer<typeof backtestFailedPayloadSchema>;
