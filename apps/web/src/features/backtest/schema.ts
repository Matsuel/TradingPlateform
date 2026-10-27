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

// Un seul schéma : les règles croisées (général <-> marché) se déclarent ici
export const backtestSchema = z
    .object({ ...general, ...market })
    .refine((v) => v.start < v.end, {
        path: ["end"],
        message: "Doit être après la date de début",
    })

export type BacktestValues = z.infer<typeof backtestSchema>