import { z } from "zod"

import { allocationTotal, FULL_PERCENT } from "@/components/form"
import type { InvestmentMode, RebalanceFrequency } from "./types"

const general = {
    name: z.string().min(1, "Requis"),
    investmentMode: z.enum(["LUMP_SUM", "RECURRING"] satisfies InvestmentMode[], { error: "Requis" }),
    // Devise de saisie, chaque mois ; requis en RECURRING seulement
    recurringAmount: z.number({ error: "Requis" }).positive().optional(),
}

const market = {
    // Poids en pourcent entier (D2) ; un champ vidé (NaN) est rejeté par z.number()
    allocations: z
        .array(z.object({
            symbol: z.string(),
            name: z.string().optional(),
            weight: z.number({ error: "Requis" }).int("Pourcent entier").min(1, "Au moins 1 %").max(FULL_PERCENT),
        }))
        .min(1, "Ajoute au moins un actif")
        .refine((rows) => allocationTotal(rows) === FULL_PERCENT, `Le total doit faire ${FULL_PERCENT} %`),
    start: z.date({ error: "Requis" }),
    end: z.date({ error: "Requis" }),
    // Devise de saisie, versé le premier jour
    initialAmount: z.number({ error: "Requis" }).min(0),
    rebalanceFrequency: z.enum(["NONE", "MONTHLY", "QUARTERLY", "YEARLY"] satisfies RebalanceFrequency[], { error: "Requis" }),
    // Pourcentage par ordre
    fee: z.number({ error: "Requis" }).min(0).max(100),
    // Au plus un symbole (SymbolsField) : vide = sans benchmark, envoyé en benchmarkSymbol par api.ts
    benchmarkSymbols: z.array(z.string().min(1)).max(1).optional(),
}

type Amounts = { investmentMode: InvestmentMode; initialAmount: number; recurringAmount?: number }

const endAfterStart = (v: { start: Date; end: Date }) => v.start < v.end
const endAfterStartError = { path: ["end"], message: "Doit être après la date de début" }
const recurringAmountRequired = (v: Amounts) => v.investmentMode !== "RECURRING" || v.recurringAmount !== undefined
const recurringAmountRequiredError = { path: ["recurringAmount"], message: "Requis" }
const initialAmountPositive = (v: Amounts) => v.investmentMode !== "LUMP_SUM" || v.initialAmount > 0
const initialAmountPositiveError = { path: ["initialAmount"], message: "Doit être supérieur à 0" }
// Versement mensuel masqué hors RECURRING : une valeur saisie avant le changement de mode n'est pas envoyée
const dropHiddenRecurringAmount = <T extends Amounts>(v: T): T =>
    v.investmentMode === "RECURRING" ? v : { ...v, recurringAmount: undefined }

// Un seul schéma : les règles croisées (général <-> allocation et période) se déclarent ici
export const backtestSchema = z
    .object({ ...general, ...market })
    .refine(endAfterStart, endAfterStartError)
    .refine(recurringAmountRequired, recurringAmountRequiredError)
    .refine(initialAmountPositive, initialAmountPositiveError)
    .transform(dropHiddenRecurringAmount)

export type BacktestValues = z.infer<typeof backtestSchema>

// Test rapide depuis la page marché : allocation à 100 % sur le symbole de la page, ajoutée à l'envoi
export const quickBacktestSchema = z
    .object({
        investmentMode: general.investmentMode,
        recurringAmount: general.recurringAmount,
        start: market.start,
        end: market.end,
        initialAmount: market.initialAmount,
        fee: market.fee,
    })
    .refine(endAfterStart, endAfterStartError)
    .refine(recurringAmountRequired, recurringAmountRequiredError)
    .refine(initialAmountPositive, initialAmountPositiveError)
    .transform(dropHiddenRecurringAmount)

export type QuickBacktestValues = z.infer<typeof quickBacktestSchema>
