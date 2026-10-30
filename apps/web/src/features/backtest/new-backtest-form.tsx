"use client"

import { useRouter } from "next/navigation"
import { FormProvider, useForm, useWatch, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { allocationTotal, FULL_PERCENT } from "@/components/form"
import { Button } from "@/components/ui/button"
import { apiIssues } from "@/lib/api"
import { prefix } from "@/lib/path"
import { DEFAULT_BENCHMARK_SYMBOL, DEFAULT_REBALANCE_FREQUENCY } from "./constants"
import { useCreateBacktest } from "./hook"
import { BacktestPreviewSummary } from "./preview-summary"
import { backtestSchema, type BacktestValues } from "./schema"
import { AllocationSection, GeneralSection } from "./sections"

export function NewBacktestForm() {
    const router = useRouter()
    const { mutateAsync, error } = useCreateBacktest()
    const form = useForm<BacktestValues>({
        resolver: zodResolver(backtestSchema),
        defaultValues: { name: "", investmentMode: "LUMP_SUM", allocations: [], initialAmount: 10_000, rebalanceFrequency: DEFAULT_REBALANCE_FREQUENCY, fee: 0.1, benchmarkSymbols: [DEFAULT_BENCHMARK_SYMBOL] },
    })
    const allocations = useWatch({ control: form.control, name: "allocations" })

    const onSubmit = async (values: BacktestValues) => {
        try {
            const backtest = await mutateAsync(values)
            router.push(`${prefix}/backtest/${backtest.id}`)
        } catch (e) {
            // 400 : chaque issue zod du backend s'affiche sous le champ de son chemin
            for (const { path, message } of apiIssues(e)) form.setError(path as FieldPath<BacktestValues>, { message })
        }
    }

    return (
        <FormProvider {...form}>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                    <GeneralSection />
                    <AllocationSection />

                    {error && <p className="text-sm text-destructive">{error.message}</p>}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting || allocationTotal(allocations) !== FULL_PERCENT}
                        >
                            Lancer le backtest
                        </Button>
                    </div>
                </form>
                <div className="lg:sticky lg:top-6">
                    <BacktestPreviewSummary />
                </div>
            </div>
        </FormProvider>
    )
}
