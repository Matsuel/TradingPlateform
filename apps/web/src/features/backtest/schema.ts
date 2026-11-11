import { z } from "zod"

import { FULL_PERCENT } from "./constants"
import type { InvestmentMode, RebalanceFrequency } from "./types"
import { allocationTotal, type BacktestTranslator } from "./utils"

type Amounts = { investmentMode: InvestmentMode; initialAmount: number; recurringAmount?: number }

const endAfterStart = (v: { start: Date; end: Date }) => v.start < v.end
const recurringAmountRequired = (v: Amounts) => v.investmentMode !== "RECURRING" || v.recurringAmount !== undefined
const initialAmountPositive = (v: Amounts) => v.investmentMode !== "LUMP_SUM" || v.initialAmount > 0
// Versement mensuel masqué hors RECURRING : une valeur saisie avant le changement de mode n'est pas envoyée
const dropHiddenRecurringAmount = <T extends Amounts>(v: T): T =>
    v.investmentMode === "RECURRING" ? v : { ...v, recurringAmount: undefined }

// Arguments de `.refine` : le prédicat et l'erreur placée sous le champ `path`
const rule = <T>(
    check: (v: T) => boolean,
    path: string[],
    message: string,
): [(v: T) => boolean, { path: string[]; message: string }] => [check, { path, message }]

// Champs communs aux deux schémas ; les messages d'erreur sont dans la langue de `t` (`backtest.validation`)
function fields(t: BacktestTranslator) {
    const required = t("validation.required")

    return {
        general: {
            name: z.string().min(1, required),
            investmentMode: z.enum(["LUMP_SUM", "RECURRING"] satisfies InvestmentMode[], { error: required }),
            // Devise de saisie, chaque mois ; requis en RECURRING seulement
            recurringAmount: z.number({ error: required }).positive().optional(),
        },
        market: {
            // Poids en pourcent entier (D2) ; un champ vidé (NaN) est rejeté par z.number()
            allocations: z
                .array(
                    z.object({
                        symbol: z.string(),
                        name: z.string().optional(),
                        weight: z
                            .number({ error: required })
                            .int(t("validation.integer"))
                            .min(1, t("validation.minWeight"))
                            .max(FULL_PERCENT),
                    }),
                )
                .min(1, t("validation.atLeastOne"))
                .refine(
                    (rows) => allocationTotal(rows) === FULL_PERCENT,
                    t("validation.total", { total: FULL_PERCENT }),
                ),
            start: z.date({ error: required }),
            end: z.date({ error: required }),
            // Devise de saisie, versé le premier jour
            initialAmount: z.number({ error: required }).min(0),
            rebalanceFrequency: z.enum(["NONE", "MONTHLY", "QUARTERLY", "YEARLY"] satisfies RebalanceFrequency[], {
                error: required,
            }),
            // Pourcentage par ordre
            fee: z.number({ error: required }).min(0).max(100),
            // Au plus un symbole (SymbolsField) : vide = sans benchmark, envoyé en benchmarkSymbol par api.ts
            benchmarkSymbols: z.array(z.string().min(1)).max(1).optional(),
        },
        // Règles croisées (général <-> allocation et période)
        refinements: {
            endAfterStart: rule(endAfterStart, ["end"], t("validation.endAfterStart")),
            recurringAmountRequired: rule(recurringAmountRequired, ["recurringAmount"], required),
            initialAmountPositive: rule(initialAmountPositive, ["initialAmount"], t("validation.greaterThanZero")),
        },
    }
}

/** Schéma du formulaire « Nouveau backtest » : un seul schéma, les règles croisées se déclarent ici. */
export function createBacktestSchema(t: BacktestTranslator) {
    const { general, market, refinements } = fields(t)
    return z
        .object({ ...general, ...market })
        .refine(...refinements.endAfterStart)
        .refine(...refinements.recurringAmountRequired)
        .refine(...refinements.initialAmountPositive)
        .transform(dropHiddenRecurringAmount)
}

export type BacktestValues = z.infer<ReturnType<typeof createBacktestSchema>>

/** Test rapide depuis la page marché : allocation à 100 % sur le symbole de la page, ajoutée à l'envoi. */
export function createQuickBacktestSchema(t: BacktestTranslator) {
    const { general, market, refinements } = fields(t)
    return z
        .object({
            investmentMode: general.investmentMode,
            recurringAmount: general.recurringAmount,
            start: market.start,
            end: market.end,
            initialAmount: market.initialAmount,
            fee: market.fee,
        })
        .refine(...refinements.endAfterStart)
        .refine(...refinements.recurringAmountRequired)
        .refine(...refinements.initialAmountPositive)
        .transform(dropHiddenRecurringAmount)
}

export type QuickBacktestValues = z.infer<ReturnType<typeof createQuickBacktestSchema>>
