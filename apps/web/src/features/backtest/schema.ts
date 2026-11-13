import { z } from "zod"

import { FULL_PERCENT, MAX_ALLOCATIONS, MAX_START_DATES, MIN_START_DATES } from "./constants"
import type { InvestmentMode, RebalanceFrequency } from "./types"
import { allocationTotal, type BacktestTranslator } from "./utils"

type Amounts = { investmentMode: InvestmentMode; initialAmount: number; recurringAmount?: number }

const endAfterStart = (v: { start: Date; end: Date }) => v.start < v.end
const recurringAmountRequired = (v: Amounts) => v.investmentMode !== "RECURRING" || v.recurringAmount !== undefined
const initialAmountPositive = (v: Amounts) => v.investmentMode !== "LUMP_SUM" || v.initialAmount > 0
// Versement mensuel masqué hors RECURRING : une valeur saisie avant le changement de mode n'est pas envoyée
const dropHiddenRecurringAmount = <T extends Amounts>(v: T): T =>
    v.investmentMode === "RECURRING" ? v : { ...v, recurringAmount: undefined }

// Lot de départs : `start` plus les dates supplémentaires, toutes distinctes et avant la fin
type Starts = { start: Date; end: Date; multipleStarts: boolean; extraStartDates: { date: Date }[] }
const allStarts = (v: Starts) => [v.start, ...v.extraStartDates.map(({ date }) => date)]
const startCountInRange = (v: Starts) =>
    !v.multipleStarts || (allStarts(v).length >= MIN_START_DATES && allStarts(v).length <= MAX_START_DATES)
const startsDistinct = (v: Starts) =>
    !v.multipleStarts || new Set(allStarts(v).map((date) => date.getTime())).size === allStarts(v).length
const startsBeforeEnd = (v: Starts) => !v.multipleStarts || allStarts(v).every((date) => date < v.end)
// Dates supplémentaires masquées hors lot : une date saisie avant de désactiver l'interrupteur n'est pas envoyée
const dropHiddenStarts = <T extends Pick<Starts, "multipleStarts" | "extraStartDates">>(v: T): T =>
    v.multipleStarts ? v : { ...v, extraStartDates: [] }

// Arguments de `.refine` : le prédicat et l'erreur placée sous le champ `path`
const rule = <T>(
    check: (v: T) => boolean,
    path: string[],
    message: string,
): [(v: T) => boolean, { path: string[]; message: string }] => [check, { path, message }]

// Poids en pourcent entier (D2) ; un champ vidé (NaN) est rejeté par z.number()
const allocationsField = (t: BacktestTranslator) =>
    z
        .array(
            z.object({
                symbol: z.string(),
                name: z.string().optional(),
                weight: z
                    .number({ error: t("validation.required") })
                    .int(t("validation.integer"))
                    .min(1, t("validation.minWeight"))
                    .max(FULL_PERCENT),
            }),
        )
        .min(1, t("validation.atLeastOne"))
        .max(MAX_ALLOCATIONS, t("validation.maxAllocations", { max: MAX_ALLOCATIONS }))
        .refine((rows) => allocationTotal(rows) === FULL_PERCENT, t("validation.total", { total: FULL_PERCENT }))

// Règles croisées (général <-> allocation et période)
function refinements(t: BacktestTranslator) {
    const required = t("validation.required")

    return {
        endAfterStart: rule(endAfterStart, ["end"], t("validation.endAfterStart")),
        recurringAmountRequired: rule(recurringAmountRequired, ["recurringAmount"], required),
        initialAmountPositive: rule(initialAmountPositive, ["initialAmount"], t("validation.greaterThanZero")),
        startCountInRange: rule(
            startCountInRange,
            ["extraStartDates"],
            t("validation.startCount", { min: MIN_START_DATES, max: MAX_START_DATES }),
        ),
        startsDistinct: rule(startsDistinct, ["extraStartDates"], t("validation.startsDistinct")),
        startsBeforeEnd: rule(startsBeforeEnd, ["end"], t("validation.endAfterStart")),
    }
}

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
            allocations: allocationsField(t),
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
        // Lot de départs (formulaire complet seulement) : `start` est le premier départ, `extraStartDates` les suivants
        batch: {
            multipleStarts: z.boolean(),
            extraStartDates: z.array(z.object({ date: z.date({ error: required }) })),
        },
        refinements: refinements(t),
    }
}

/** Schéma du formulaire « Nouveau backtest » : un seul schéma, les règles croisées se déclarent ici. */
export function createBacktestFormSchema(t: BacktestTranslator) {
    const { general, market, batch, refinements } = fields(t)
    return z
        .object({ ...general, ...market, ...batch })
        .refine(...refinements.endAfterStart)
        .refine(...refinements.recurringAmountRequired)
        .refine(...refinements.initialAmountPositive)
        .refine(...refinements.startCountInRange)
        .refine(...refinements.startsDistinct)
        .refine(...refinements.startsBeforeEnd)
        .transform(dropHiddenRecurringAmount)
        .transform(dropHiddenStarts)
}

export type BacktestValues = z.infer<ReturnType<typeof createBacktestFormSchema>>

/** Test rapide depuis la page marché : allocation à 100 % sur le symbole de la page, ajoutée à l'envoi. */
export function createQuickBacktestFormSchema(t: BacktestTranslator) {
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

export type QuickBacktestValues = z.infer<ReturnType<typeof createQuickBacktestFormSchema>>
