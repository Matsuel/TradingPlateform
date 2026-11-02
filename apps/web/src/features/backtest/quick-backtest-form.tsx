"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { differenceInCalendarDays, subYears } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { Dash } from "@/components/dash"
import { DetailRow } from "@/components/detail-row"
import { setFormIssues } from "@/components/form/form-issues"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { routes } from "@/lib/routes"
import {
    DEFAULT_FEE_PERCENT,
    DEFAULT_INITIAL_AMOUNT,
    DEFAULT_INVESTMENT_MODE,
    DEFAULT_REBALANCE_FREQUENCY,
    FULL_PERCENT,
} from "./constants"
import { useCreateBacktest } from "./hook"
import { type QuickBacktestValues, quickBacktestSchema } from "./schema"
import { InvestmentModeFields, PeriodAndCapitalFields } from "./sections"

// Récapitulatif : symbole testé et nombre de jours calendaires de la période saisie
function QuickTestSummary({ symbol }: { symbol: string }) {
    const [start, end] = useWatch<QuickBacktestValues, ["start", "end"]>({ name: ["start", "end"] })
    const days = start && end ? differenceInCalendarDays(end, start) : 0

    return (
        <dl className="grid gap-2 rounded-md bg-muted p-4">
            <DetailRow label="Symbole">{symbol}</DetailRow>
            <DetailRow label="Données analysées">{days > 0 ? `${days} jours` : <Dash />}</DetailRow>
        </dl>
    )
}

function QuickTestActions({ submitting }: { submitting: boolean }) {
    return (
        <div className="mt-auto flex gap-3">
            <Button
                variant="outline"
                className="flex-1"
                nativeButton={false}
                render={<Link href={routes.newBacktest} />}
            >
                Configuration avancée
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
                Lancer le test
            </Button>
        </div>
    )
}

/**
 * Test rapide sur un seul symbole (maquette 12.1) : mode, période, capital et frais, allocation à 100 % sur `symbol`
 * ajoutée à l'envoi. Un `400` place chaque issue sous son champ ; redirige vers le détail créé.
 */
export function QuickBacktestForm({ symbol }: { symbol: string }) {
    const router = useRouter()
    const { mutateAsync, error } = useCreateBacktest()
    const form = useForm<QuickBacktestValues>({
        resolver: zodResolver(quickBacktestSchema),
        defaultValues: {
            investmentMode: DEFAULT_INVESTMENT_MODE,
            start: subYears(new Date(), 1),
            end: new Date(),
            initialAmount: DEFAULT_INITIAL_AMOUNT,
            fee: DEFAULT_FEE_PERCENT,
        },
    })

    const onSubmit = async (values: QuickBacktestValues) => {
        try {
            const backtest = await mutateAsync({
                ...values,
                name: `Test rapide ${symbol}`,
                allocations: [{ symbol, weight: FULL_PERCENT }],
                rebalanceFrequency: DEFAULT_REBALANCE_FREQUENCY,
            })
            router.push(routes.backtest(backtest.id))
        } catch (e) {
            setFormIssues(e, form.setError)
        }
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-5">
                <InvestmentModeFields />
                <PeriodAndCapitalFields />
                <QuickTestSummary symbol={symbol} />
                <p className="text-small text-muted-foreground">
                    Test rapide sur ce symbole. Pour comparer plusieurs symboles, utilisez la page Backtests.
                </p>
                {error && <FieldError>{error.message}</FieldError>}
                <QuickTestActions submitting={form.formState.isSubmitting} />
            </form>
        </FormProvider>
    )
}
