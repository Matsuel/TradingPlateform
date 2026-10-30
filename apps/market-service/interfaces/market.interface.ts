import { z } from "zod";

export const searchMarketSchema = z.object({
    query: z.string().trim().min(2),
});

export const marketIdSchema = z.string().trim().min(1);
