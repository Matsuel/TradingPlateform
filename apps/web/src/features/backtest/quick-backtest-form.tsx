"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { differenceInCalendarDays, subYears } from "date-fns"

import { DateField, FieldRow, NumberField, SelectField } from "@/components/form"
import { Button } from "@/components/ui/button"
import { prefix } from "@/lib/path"
import { strategyOptions } from "./constants"
import { useCreateBacktest } from "./hook"
import { quickBacktestSchema, type QuickBacktestValues } from "./schema"

export function QuickBacktestForm({ symbol }: { symbol: string }) {
    const router = useRouter()
    const { mutateAsync, error } = useCreateBacktest()
    const form = useForm<QuickBacktestValues>({
        resolver: zodResolver(quickBacktestSchema),
        defaultValues: { strategy: "dca", start: subYears(new Date(), 1), end: new Date(), amount: 10_000, fee: 0.1 },
    })
    const [strategy, start, end] = useWatch({ control: form.control, name: ["strategy", "start", "end"] })
    const days = start && end ? differenceInCalendarDays(end, start) : null

    const onSubmit = async (values: QuickBacktestValues) => {
        await mutateAsync({ ...values, name: `Test rapide ${symbol}`, symbols: [symbol] })
        router.push(`${prefix}/backtest`)
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-5">
                <SelectField name="strategy" label="Stratégie" options={strategyOptions} />
                <FieldRow>
                    <DateField name="start" label="Début" />
                    <DateField name="end" label="Fin" />
                </FieldRow>
                <FieldRow>
                    <NumberField
                        name="amount"
                        label={strategy === "lump_sum" ? "Capital initial (€)" : "Montant mensuel (€)"}
                    />
                    <NumberField name="fee" label="Frais par ordre (%)" />
                </FieldRow>

                <dl className="grid gap-2 rounded-md bg-muted p-4">
                    <div className="flex items-center gap-2">
                        <dt className="flex-1 text-muted-foreground">Symbole</dt>
                        <dd className="font-medium">{symbol}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                        <dt className="flex-1 text-muted-foreground">Données analysées</dt>
                        <dd className="font-medium">{days !== null && days > 0 ? `${days} jours` : "—"}</dd>
                    </div>
                </dl>

                <p className="text-xs text-muted-foreground">
                    Test rapide sur ce symbole. Pour comparer plusieurs symboles, utilisez la page Backtests.
                </p>

                {error && <p className="text-sm text-destructive">{error.message}</p>}

                <div className="mt-auto flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        nativeButton={false}
                        render={<Link href={`${prefix}/backtest/new`} />}
                    >
                        Configuration avancée
                    </Button>
                    <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                        Lancer le test
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}
