import { z } from "zod";
import { MAX_CLOSES_SYMBOLS } from "@trading-plateform/contracts";

export const searchMarketSchema = z.object({
    query: z.string().trim().min(2),
});

export const marketIdSchema = z.string().trim().min(1);

// ?symbols=AAPL,MSFT&start=<ISO>&end=<ISO> : cours de clôture journaliers (closes) ou dividendes (dividends) de `start` à `end`
export const dailyClosesQuerySchema = z
    .object({
        symbols: z
            .string()
            .transform((value) => [...new Set(value.split(",").map((symbol) => symbol.trim()).filter(Boolean))])
            .pipe(z.array(z.string()).min(1).max(MAX_CLOSES_SYMBOLS)),
        start: z.iso.datetime().transform((value) => new Date(value)),
        end: z.iso.datetime().transform((value) => new Date(value)),
    })
    .refine((query) => query.start < query.end, { path: ["end"] });

export type DailyClosesQuery = z.infer<typeof dailyClosesQuerySchema>;
