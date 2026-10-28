import { z } from "zod";
import type { Prisma } from "../generated/prisma/client";

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

export type BacktestWithExecutions = Prisma.BacktestGetPayload<{
    include: { executions: { include: { result: true } } };
}>;
