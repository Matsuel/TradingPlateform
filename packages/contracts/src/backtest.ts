import { z } from "zod";
import { kafkaEventSchema } from "./event";

export const BACKTEST_TOPICS = {
    requested: "backtest.requested",
    started: "backtest.started",
    completed: "backtest.completed",
    failed: "backtest.failed",
} as const;

export const backtestRequestedPayloadSchema = z.object({
    executionId: z.string().min(1),
    backtestId: z.string().min(1),
    userId: z.string().min(1),
    symbols: z.array(z.string().min(1)).min(1),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
    investmentMode: z.enum(["LUMP_SUM", "RECURRING"]),
    initialAmount: z.number().min(0),
    recurringAmount: z.number().positive().nullable(),
    investmentFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).nullable(),
    // Ratio : 0.001 = 0,1 % par achat
    feeRate: z.number().min(0).max(1),
});

export const backtestStartedPayloadSchema = z.object({
    executionId: z.string().min(1),
    startedAt: z.iso.datetime(),
});

export const equityPointSchema = z.object({
    date: z.iso.date(),
    value: z.number(),
    // Total versé à cette date, frais compris
    invested: z.number(),
});

export const tradeSchema = z.object({
    date: z.iso.date(),
    symbol: z.string().min(1),
    // Cours d'achat
    price: z.number().positive(),
    // Nombre de titres achetés (fractionnaire)
    quantity: z.number().positive(),
    // Montant versé pour cet achat, frais compris, devise saisie
    amount: z.number().positive(),
    // Frais prélevés sur cet achat, devise saisie
    fee: z.number().min(0),
});

export const holdingSchema = z.object({
    symbol: z.string().min(1),
    // Titres détenus en fin de simulation (fractionnaire)
    quantity: z.number().min(0),
    // Valeur au dernier cours connu, devise saisie
    value: z.number().min(0),
});

export const backtestCompletedPayloadSchema = z.object({
    executionId: z.string().min(1),
    finishedAt: z.iso.datetime(),
    finalValue: z.number(),
    // Total versé, frais compris
    totalInvested: z.number().positive(),
    // Somme des frais prélevés sur les achats, dans la devise saisie (inclus dans totalInvested)
    totalFees: z.number().min(0),
    totalReturn: z.number(),
    totalTrades: z.number().int().min(0),
    // Ratio ≤ 0, mesuré hors versements (performance pondérée dans le temps)
    maxDrawdown: z.number().max(0),
    maxDrawdownDate: z.iso.date().nullable(),
    equityCurve: z.array(equityPointSchema),
    trades: z.array(tradeSchema),
    holdings: z.array(holdingSchema),
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

export type BacktestRequestedPayload = z.infer<typeof backtestRequestedPayloadSchema>;
export type BacktestStartedPayload = z.infer<typeof backtestStartedPayloadSchema>;
export type EquityPoint = z.infer<typeof equityPointSchema>;
export type Trade = z.infer<typeof tradeSchema>;
export type Holding = z.infer<typeof holdingSchema>;
export type BacktestCompletedPayload = z.infer<typeof backtestCompletedPayloadSchema>;
export type BacktestFailedPayload = z.infer<typeof backtestFailedPayloadSchema>;
