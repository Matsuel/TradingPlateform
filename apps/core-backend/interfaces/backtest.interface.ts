import { z } from "zod";
import type { BacktestCompletedPayload } from "@trading-plateform/contracts";
import type { BacktestResult, Prisma } from "../generated/prisma/client";

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

export type CreateBacktestDTO = Prisma.BacktestUncheckedCreateInput;

// Courbe et ordres omis des exécutions : seul le dernier résultat terminé les porte
export type BacktestWithExecutions = Prisma.BacktestGetPayload<{
    include: { executions: { include: { result: { omit: { equityCurve: true; trades: true } } } } };
}>;

export type BacktestDetails = BacktestWithExecutions & { result: BacktestResult | null };

export type CompleteExecutionDTO = Omit<BacktestCompletedPayload, "executionId" | "finishedAt" | "maxDrawdownDate"> & {
    finishedAt: Date;
    maxDrawdownDate: Date | null;
};
