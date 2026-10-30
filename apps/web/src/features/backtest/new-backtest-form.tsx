"use client"

import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { prefix } from "@/lib/path"
import { useCreateBacktest } from "./hook"
import { backtestSchema, type BacktestValues } from "./schema"
import { GeneralSection, MarketSection } from "./sections"

export function NewBacktestForm() {
    const router = useRouter()
    const { mutateAsync, error } = useCreateBacktest()
    const form = useForm<BacktestValues>({
        resolver: zodResolver(backtestSchema),
        defaultValues: { name: "", strategy: "dca", symbols: [], amount: 1_000, fee: 0.1 },
    })

    const onSubmit = async (values: BacktestValues) => {
        const backtest = await mutateAsync(values)
        router.push(`${prefix}/backtest/${backtest.id}`)
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <GeneralSection />
                <MarketSection />

                {error && <p className="text-sm text-destructive">{error.message}</p>}

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        Lancer le backtest
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}
