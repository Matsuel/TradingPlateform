import { z } from "zod";
import { paginationQuerySchema, type BacktestCompletedPayload, type BacktestStatus as ContractBacktestStatus } from "@trading-plateform/contracts";
import { BacktestStatus, type BacktestResult, type Prisma } from "../generated/prisma/client";

export const createBacktestSchema = z
    .object({
        name: z.string().min(1),
        strategy: z.enum(["dca", "lump_sum"]),
        symbols: z.array(z.string().min(1)).min(1),
        start: z.coerce.date(),
        end: z.coerce.date(),
        amount: z.number().positive(),
        fee: z.number().min(0).max(100),
    })
    .refine((v) => v.start < v.end, {
        path: ["end"],
        message: "Must be after start",
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

// Courbe, ordres, positions et comparaison omis des exécutions : seul le dernier résultat terminé les porte
export type BacktestWithExecutions = Prisma.BacktestGetPayload<{
    include: { executions: { include: { result: { omit: { equityCurve: true; trades: true; holdings: true; lumpSumComparison: true } } } } };
}>;

export type BacktestDetails = BacktestWithExecutions & { result: BacktestResult | null };

export type CompleteExecutionDTO = Omit<BacktestCompletedPayload, "executionId" | "finishedAt" | "maxDrawdownDate"> & {
    finishedAt: Date;
    maxDrawdownDate: Date | null;
};

// Le contrat recopie l'enum Prisma pour le web : ce type ne compile plus si les deux listes divergent
type AssertTrue<T extends true> = T;
type SameUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export type BacktestStatusesInSync = AssertTrue<SameUnion<BacktestStatus, ContractBacktestStatus>>;

export interface BacktestStatusCounts {
    total: number; // backtests de l'utilisateur, avec ou sans exécution
    byStatus: { status: BacktestStatus; count: number }[]; // par statut de la dernière exécution
}
