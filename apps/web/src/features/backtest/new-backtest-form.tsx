"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { FormProvider, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { setFormIssues } from "@/lib/api"
import { routes } from "@/lib/routes"
import {
    DEFAULT_BENCHMARK_SYMBOL,
    DEFAULT_FEE_PERCENT,
    DEFAULT_INITIAL_AMOUNT,
    DEFAULT_INVESTMENT_MODE,
    DEFAULT_REBALANCE_FREQUENCY,
    FULL_PERCENT,
} from "./constants"
import { useCreateBacktest } from "./hook"
import { BacktestPreviewSummary } from "./preview-summary"
import { type BacktestValues, backtestSchema } from "./schema"
import { AllocationSection, GeneralSection } from "./sections"
import { allocationTotal } from "./utils"

export function NewBacktestForm() {
    const router = useRouter()
    const { mutateAsync, error } = useCreateBacktest()
    const form = useForm<BacktestValues>({
        resolver: zodResolver(backtestSchema),
        defaultValues: {
            name: "",
            investmentMode: DEFAULT_INVESTMENT_MODE,
            allocations: [],
            initialAmount: DEFAULT_INITIAL_AMOUNT,
            rebalanceFrequency: DEFAULT_REBALANCE_FREQUENCY,
            fee: DEFAULT_FEE_PERCENT,
            benchmarkSymbols: [DEFAULT_BENCHMARK_SYMBOL],
        },
    })
    const allocations = useWatch({ control: form.control, name: "allocations" })

    const onSubmit = async (values: BacktestValues) => {
        try {
            const backtest = await mutateAsync(values)
            router.push(routes.backtest(backtest.id))
        } catch (e) {
            setFormIssues(e, form.setError)
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
