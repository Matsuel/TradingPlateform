import { z } from "zod"

const general = {
    name: z.string().min(1, "Requis"),
    strategy: z.enum(["dca", "lump_sum"], { error: "Requis" })
}

const market = {
    symbols: z.array(z.string()).min(1, "Ajoute au moins un symbole"),
    start: z.date({ error: "Requis" }),
    end: z.date({ error: "Requis" }),
    amount: z.number({ error: "Requis" }).positive(),
    fee: z.number({ error: "Requis" }).min(0).max(100),
}

const endAfterStart = (v: { start: Date; end: Date }) => v.start < v.end
const endAfterStartError = { path: ["end"], message: "Doit être après la date de début" }

// Un seul schéma : les règles croisées (général <-> marché) se déclarent ici
export const backtestSchema = z
    .object({ ...general, ...market })
    .refine(endAfterStart, endAfterStartError)

export type BacktestValues = z.infer<typeof backtestSchema>

// Test rapide depuis la page marché : un seul symbole, fourni par la page
export const quickBacktestSchema = z
    .object({ strategy: general.strategy, start: market.start, end: market.end, amount: market.amount, fee: market.fee })
    .refine(endAfterStart, endAfterStartError)

export type QuickBacktestValues = z.infer<typeof quickBacktestSchema>
