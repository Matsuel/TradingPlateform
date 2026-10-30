import { z } from "zod";
import {
    allocationSchema,
    backtestRequestedPayloadSchema,
    paginationQuerySchema,
    type BacktestCompletedPayload,
    type BacktestStatus as ContractBacktestStatus,
} from "@trading-plateform/contracts";
import { BacktestStatus, type BacktestResult, type Prisma } from "../generated/prisma/client";

const FULL_PERCENT = 100;

// Poids saisi en pourcent entier (60 = 60 %, D2), contrôlé en pourcent puis converti en ratio pour le contrat et la base
const allocationInputsSchema = z
    .array(z.object({ symbol: allocationSchema.shape.symbol, weight: z.number().int().min(1).max(FULL_PERCENT) }))
    .min(1)
    .refine((allocations) => new Set(allocations.map((a) => a.symbol)).size === allocations.length, {
        message: "Symbols must be unique",
    })
    .refine((allocations) => allocations.reduce((sum, a) => sum + a.weight, 0) === FULL_PERCENT, {
        message: "Weights must sum to 100",
    })
    .transform((allocations) => allocations.map(({ symbol, weight }) => ({ symbol, weight: weight / FULL_PERCENT })));

export const createBacktestSchema = z
    .object({
        name: z.string().min(1),
        investmentMode: backtestRequestedPayloadSchema.shape.investmentMode,
        allocations: allocationInputsSchema,
        start: z.coerce.date(),
        end: z.coerce.date(),
        // Montants dans la devise de saisie : capital versé le premier jour, puis versement mensuel (RECURRING seulement)
        initialAmount: z.number().min(0),
        recurringAmount: z.number().positive().optional(),
        rebalanceFrequency: backtestRequestedPayloadSchema.shape.rebalanceFrequency.default("NONE"),
        // Pourcentage par ordre (0.1 = 0,1 %), stocké en fraction
        fee: z.number().min(0).max(100),
        // Symbole rejoué avec les mêmes versements et frais (D9) ; absent ou null sans benchmark
        benchmarkSymbol: backtestRequestedPayloadSchema.shape.benchmarkSymbol.optional(),
    })
    .refine((v) => v.start < v.end, {
        path: ["end"],
        message: "Must be after start",
    })
    .refine((v) => v.investmentMode !== "RECURRING" || v.recurringAmount !== undefined, {
        path: ["recurringAmount"],
        message: "Required for RECURRING",
    })
    .refine((v) => v.investmentMode !== "LUMP_SUM" || v.recurringAmount === undefined, {
        path: ["recurringAmount"],
        message: "Only allowed for RECURRING",
    })
    .refine((v) => v.investmentMode !== "LUMP_SUM" || v.initialAmount > 0, {
        path: ["initialAmount"],
        message: "Must be positive for LUMP_SUM",
    });

export type CreateBacktestInput = z.infer<typeof createBacktestSchema>;

// ?status=PENDING,RUNNING : filtre sur le statut de la dernière exécution
export const backtestListQuerySchema = paginationQuerySchema.extend({
    status: z
        .string()
        .transform((v) => v.split(","))
        .pipe(z.array(z.enum(BacktestStatus)))
        .optional(),
});

export type BacktestListQuery = z.infer<typeof backtestListQuerySchema>;

export type CreateBacktestDTO = Prisma.BacktestUncheckedCreateInput;

// Courbe, ordres, positions et comparaisons omis des exécutions : seul le dernier résultat terminé les porte
export type BacktestWithExecutions = Prisma.BacktestGetPayload<{
    include: { allocations: true; executions: { include: { result: { omit: { equityCurve: true; trades: true; holdings: true; lumpSumComparison: true; benchmark: true } } } } };
}>;

export type BacktestDetails = BacktestWithExecutions & { result: BacktestResult | null };

export type CompleteExecutionDTO = Omit<
    BacktestCompletedPayload,
    | "executionId"
    | "finishedAt"
    | "maxDrawdownDate"
    | "maxDrawdownPeakDate"
    | "maxDrawdownRecoveryDate"
> & {
    finishedAt: Date;
    maxDrawdownDate: Date | null;
    maxDrawdownPeakDate: Date | null;
    maxDrawdownRecoveryDate: Date | null;
};

// Le contrat recopie l'enum Prisma pour le web : ce type ne compile plus si les deux listes divergent
type AssertTrue<T extends true> = T;
type SameUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export type BacktestStatusesInSync = AssertTrue<SameUnion<BacktestStatus, ContractBacktestStatus>>;

export interface BacktestStatusCounts {
    total: number; // backtests de l'utilisateur, avec ou sans exécution
    byStatus: { status: BacktestStatus; count: number }[]; // par statut de la dernière exécution
}
