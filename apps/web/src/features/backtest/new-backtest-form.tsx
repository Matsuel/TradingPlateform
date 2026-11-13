"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { setFormIssues } from "@/components/form/form-issues"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { useApiErrorMessages } from "@/lib/api-error"
import { routes } from "@/lib/routes"
import {
    DEFAULT_BENCHMARK_SYMBOL,
    DEFAULT_FEE_PERCENT,
    DEFAULT_INITIAL_AMOUNT,
    DEFAULT_INVESTMENT_MODE,
    DEFAULT_REBALANCE_FREQUENCY,
    FULL_PERCENT,
} from "./constants"
import { useCreateBacktest, useCreateBacktestBatch } from "./hook"
import { BacktestPreviewSummary } from "./preview-summary"
import { type BacktestValues, createBacktestFormSchema } from "./schema"
import { AllocationSection, GeneralSection } from "./sections"
import { allocationTotal } from "./utils"

export function NewBacktestForm() {
    const t = useTranslations("backtest")
    const { errorMessage, issueMessage } = useApiErrorMessages()
    const router = useRouter()
    const create = useCreateBacktest()
    const createBatch = useCreateBacktestBatch()
    const error = create.error ?? createBatch.error
    const form = useForm<BacktestValues>({
        resolver: zodResolver(createBacktestFormSchema(t)),
        defaultValues: {
            name: "",
            investmentMode: DEFAULT_INVESTMENT_MODE,
            allocations: [],
            initialAmount: DEFAULT_INITIAL_AMOUNT,
            rebalanceFrequency: DEFAULT_REBALANCE_FREQUENCY,
            fee: DEFAULT_FEE_PERCENT,
            benchmarkSymbols: [DEFAULT_BENCHMARK_SYMBOL],
            multipleStarts: false,
            extraStartDates: [],
        },
    })
    const allocations = useWatch({ control: form.control, name: "allocations" })
    const [multipleStarts, start, extraStartDates] = useWatch({
        control: form.control,
        name: ["multipleStarts", "start", "extraStartDates"],
    })
    // Une ligne de départ ajoutée et restée vide bloque l'envoi
    const startsIncomplete = multipleStarts && [start, ...extraStartDates.map(({ date }) => date)].some((date) => !date)

    const onSubmit = async (values: BacktestValues) => {
        try {
            if (values.multipleStarts) {
                const { batchId } = await createBatch.mutateAsync(values)
                router.push(routes.backtestBatch(batchId))
            } else {
                const backtest = await create.mutateAsync(values)
                router.push(routes.backtest(backtest.id))
            }
        } catch (e) {
            setFormIssues(e, form.setError, issueMessage)
        }
    }

    return (
        <FormProvider {...form}>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                    <GeneralSection />
                    <AllocationSection />

                    {error && <FieldError>{errorMessage(error)}</FieldError>}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={
                                form.formState.isSubmitting ||
                                startsIncomplete ||
                                allocationTotal(allocations) !== FULL_PERCENT
                            }
                        >
                            {t("form.submit")}
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
