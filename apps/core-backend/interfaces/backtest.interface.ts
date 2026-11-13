import { z } from "zod";
import { addYears } from "@trading-plateform/utils";
import {
    API_ERROR_CODES,
    API_ERROR_MESSAGES,
    BATCH_MIN_YEARS_BEFORE_END,
    BATCH_START_DATES_LIMITS,
    MAX_CLOSES_SYMBOLS,
    allocationSchema,
    backtestRequestedPayloadSchema,
    paginationQuerySchema,
    type BacktestBatch,
    type BacktestBatchRow,
    type BacktestCompletedPayload,
    type BacktestComparison,
    type ComparedMetric,
    type RollingWindow,
    type BacktestStatus as ContractBacktestStatus,
} from "@trading-plateform/contracts";
import { BacktestStatus, type BacktestResult, type Prisma } from "../generated/prisma/client";
import type { batchBacktest, batchResult, comparedBacktest, comparedResult } from "../repositories/backtest.repository";

const FULL_PERCENT = 100;

// Poids saisi en pourcent entier (60 = 60 %, D2), contrôlé en pourcent puis converti en ratio pour le contrat et la base
const allocationInputsSchema = z
    .array(z.object({ symbol: allocationSchema.shape.symbol, weight: z.number().int().min(1).max(FULL_PERCENT) }))
    .min(1)
    // Le benchmark prend un symbole de plus dans la requête de cours (GET /api/market/closes, MAX_CLOSES_SYMBOLS)
    .max(MAX_CLOSES_SYMBOLS - 1)
    .refine((allocations) => new Set(allocations.map((a) => a.symbol)).size === allocations.length, {
        message: API_ERROR_MESSAGES.SYMBOLS_NOT_UNIQUE,
        params: { code: API_ERROR_CODES.SYMBOLS_NOT_UNIQUE },
    })
    .refine((allocations) => allocations.reduce((sum, a) => sum + a.weight, 0) === FULL_PERCENT, {
        message: API_ERROR_MESSAGES.WEIGHTS_NOT_100,
        params: { code: API_ERROR_CODES.WEIGHTS_NOT_100 },
    })
    .transform((allocations) => allocations.map(({ symbol, weight }) => ({ symbol, weight: weight / FULL_PERCENT })));

// Champs communs à un backtest seul et à un lot de départs ; les dates de début sont propres à chacun
const backtestFields = {
    name: z.string().min(1),
    investmentMode: backtestRequestedPayloadSchema.shape.investmentMode,
    allocations: allocationInputsSchema,
    end: z.coerce.date(),
    // Montants dans la devise de saisie : capital versé le premier jour, puis versement mensuel (RECURRING seulement)
    initialAmount: z.number().min(0),
    recurringAmount: z.number().positive().optional(),
    rebalanceFrequency: backtestRequestedPayloadSchema.shape.rebalanceFrequency.default("NONE"),
    // Pourcentage par ordre (0.1 = 0,1 %), stocké en fraction
    fee: z.number().min(0).max(100),
    // Symbole rejoué avec les mêmes versements et frais (D9) ; absent ou null sans benchmark
    benchmarkSymbol: backtestRequestedPayloadSchema.shape.benchmarkSymbol.optional(),
};

// Règles de cohérence du mode d'investissement, communes à un backtest seul et à un lot
const withInvestmentRules = <T extends z.ZodType<{ investmentMode: "LUMP_SUM" | "RECURRING"; initialAmount: number; recurringAmount?: number }>>(schema: T) =>
    schema
        .refine((v) => v.investmentMode !== "RECURRING" || v.recurringAmount !== undefined, {
            path: ["recurringAmount"],
            message: API_ERROR_MESSAGES.RECURRING_AMOUNT_REQUIRED,
            params: { code: API_ERROR_CODES.RECURRING_AMOUNT_REQUIRED },
        })
        .refine((v) => v.investmentMode !== "LUMP_SUM" || v.recurringAmount === undefined, {
            path: ["recurringAmount"],
            message: API_ERROR_MESSAGES.RECURRING_AMOUNT_NOT_ALLOWED,
            params: { code: API_ERROR_CODES.RECURRING_AMOUNT_NOT_ALLOWED },
        })
        .refine((v) => v.investmentMode !== "LUMP_SUM" || v.initialAmount > 0, {
            path: ["initialAmount"],
            message: API_ERROR_MESSAGES.INITIAL_AMOUNT_NOT_POSITIVE,
            params: { code: API_ERROR_CODES.INITIAL_AMOUNT_NOT_POSITIVE },
        });

export const createBacktestSchema = withInvestmentRules(
    z
        .object({ ...backtestFields, start: z.coerce.date() })
        .refine((v) => v.start < v.end, {
            path: ["end"],
            message: API_ERROR_MESSAGES.END_BEFORE_START,
            params: { code: API_ERROR_CODES.END_BEFORE_START },
        }),
);

/** Dernier départ admis pour une fin commune `end` : `BATCH_MIN_YEARS_BEFORE_END` an avant. */
export const latestBatchStart = (end: Date) => addYears(end, -BATCH_MIN_YEARS_BEFORE_END)

// 2 à 10 dates de départ distinctes (D1)
const startDatesSchema = z
    .array(z.coerce.date())
    .min(BATCH_START_DATES_LIMITS.min)
    .max(BATCH_START_DATES_LIMITS.max)
    .refine((dates) => new Set(dates.map((date) => date.getTime())).size === dates.length, {
        message: API_ERROR_MESSAGES.START_DATES_NOT_UNIQUE,
        params: { code: API_ERROR_CODES.START_DATES_NOT_UNIQUE },
    })

// Nouvelles dates de départ d'un lot existant : la stratégie et la fin commune sont celles du lot
export const batchStartDatesSchema = z.object({ startDates: startDatesSchema })

export type BatchStartDatesInput = z.infer<typeof batchStartDatesSchema>

// Lot de départs (D1) : la même stratégie lancée à chaque date de `startDates`, 2 à 10 dates distinctes, chacune au moins
// `BATCH_MIN_YEARS_BEFORE_END` an avant `end` (la fin commune)
export const createBatchSchema = withInvestmentRules(
    z
        .object({ ...backtestFields, startDates: startDatesSchema })
        .refine((v) => v.startDates.every((start) => start <= latestBatchStart(v.end)), {
            path: ["startDates"],
            message: API_ERROR_MESSAGES.START_TOO_CLOSE_TO_END,
            params: { code: API_ERROR_CODES.START_TOO_CLOSE_TO_END },
        }),
);

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export type CreateBacktestInput = z.infer<typeof createBacktestSchema>;

// ?status=PENDING,RUNNING : filtre sur le statut de la dernière exécution
// ?hasResult=true : seulement les backtests qui ont au moins une exécution COMPLETED (comparables), même relancés depuis
export const backtestListQuerySchema = paginationQuerySchema.extend({
    status: z
        .string()
        .transform((v) => v.split(","))
        .pipe(z.array(z.enum(BacktestStatus)))
        .optional(),
    hasResult: z.stringbool().optional(),
});

export type BacktestListQuery = z.infer<typeof backtestListQuerySchema>;

// Filtres de la liste : statut de la dernière exécution, et au moins une exécution (même ancienne) à l'un de ces statuts
export type BacktestListFilters = Pick<BacktestListQuery, "status"> & { executionStatus?: BacktestStatus[] };

// ?ids=a,b : exactement deux backtests distincts, comparés A − B dans cet ordre
export const backtestCompareQuerySchema = z.object({
    ids: z
        .string()
        .transform((v) => v.split(","))
        .pipe(z.tuple([z.string().min(1), z.string().min(1)]))
        .refine(([a, b]) => a !== b, { message: API_ERROR_MESSAGES.IDS_NOT_DISTINCT, params: { code: API_ERROR_CODES.IDS_NOT_DISTINCT } }),
});

export type BacktestCompareQuery = z.infer<typeof backtestCompareQuerySchema>;

// Lecture légère avant comparaison : nombre d'exécutions aux statuts demandés, sans aucune colonne lourde
export type BacktestExecutionCount = Prisma.BacktestGetPayload<{
    select: { id: true; _count: { select: { executions: true } } };
}>;

// Backtest comparé : paramètres, allocation et dernière exécution COMPLETED avec ses métriques et sa courbe
export type ComparedBacktestRecord = Prisma.BacktestGetPayload<{
    select: typeof comparedBacktest & { executions: { select: { result: { select: typeof comparedResult } } } };
}>;

export type CreateBacktestDTO = Prisma.BacktestUncheckedCreateInput;

// Courbe, ordres, positions et comparaisons omis des exécutions : seul le dernier résultat terminé les porte
export type BacktestWithExecutions = Prisma.BacktestGetPayload<{
    include: { allocations: true; executions: { include: { result: { omit: { equityCurve: true; trades: true; holdings: true; lumpSumComparison: true; benchmark: true; rollingSummary: true } } } } };
}>;

// Résultat de la dernière exécution COMPLETED remonté au niveau du backtest
export type ComparedBacktestDTO = Omit<ComparedBacktestRecord, "executions"> & {
    result: NonNullable<ComparedBacktestRecord["executions"][number]["result"]>;
};

// Forme du contrat BacktestComparison avant sérialisation (Decimal, Date)
export type BacktestComparisonDTO = Omit<BacktestComparison, "a" | "b"> & { a: ComparedBacktestDTO; b: ComparedBacktestDTO };

// Départ d'un lot : paramètres et dernière exécution, métriques de son dernier résultat terminé
export type BatchBacktestRecord = Prisma.BacktestGetPayload<{
    select: typeof batchBacktest & {
        latestExecution: { select: { status: true } };
        executions: { select: { result: { select: typeof batchResult } } };
    };
}>;

// Lecture d'un lot : ses départs, et les fenêtres glissantes stockées du départ le plus ancien terminé (JSON du résultat)
export interface BatchRecords {
    backtests: BatchBacktestRecord[];
    rollingSummary: RollingWindow[] | null;
}

// Forme du contrat BacktestBatch avant sérialisation (Decimal, Date)
export type BacktestBatchDTO = Omit<BacktestBatch, "rows" | "endDate"> & {
    endDate: Date;
    rows: (Omit<BacktestBatchRow, "startDate" | "result"> & {
        startDate: Date;
        result: Pick<NonNullable<BatchBacktestRecord["executions"][number]["result"]>, ComparedMetric | "finalValue"> | null;
    })[];
};

export type BacktestDetails = BacktestWithExecutions & { result: BacktestResult | null };

export type CompleteExecutionDTO = Omit<
    BacktestCompletedPayload,
    | "executionId"
    | "finishedAt"
    | "maxDrawdownDate"
    | "maxDrawdownPeakDate"
    | "maxDrawdownRecoveryDate"
> & {
    finishedAt: Date;
    maxDrawdownDate: Date | null;
    maxDrawdownPeakDate: Date | null;
    maxDrawdownRecoveryDate: Date | null;
};

// Le contrat recopie l'enum Prisma pour le web : ce type ne compile plus si les deux listes divergent
type AssertTrue<T extends true> = T;
type SameUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export type BacktestStatusesInSync = AssertTrue<SameUnion<BacktestStatus, ContractBacktestStatus>>;

export interface BacktestStatusCounts {
    total: number; // backtests de l'utilisateur, avec ou sans exécution
    byStatus: { status: BacktestStatus; count: number }[]; // par statut de la dernière exécution
}
