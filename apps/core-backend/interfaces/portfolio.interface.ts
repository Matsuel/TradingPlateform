import { z } from "zod";
import type { Prisma } from "../generated/prisma/client";

export const portfolioSchema = z.object({
    name: z.string().min(1),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;

export type CreatePortfolioDTO = Prisma.PortfolioUncheckedCreateInput;

export type UpdatePortfolioDTO = Pick<Prisma.PortfolioUpdateInput, "name">;
