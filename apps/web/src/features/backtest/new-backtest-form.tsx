"use client"

import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { GeneralSection, MarketSection } from "./sections"
import { backtestSchema, type BacktestValues } from "./schema"

export function NewBacktestForm({ onSubmit }: { onSubmit: (values: BacktestValues) => Promise<void> | void }) {
    const form = useForm<BacktestValues>({
        resolver: zodResolver(backtestSchema),
        defaultValues: { name: "", strategy: "dca", symbols: [], amount: 1_000, fee: 0.1 },
    })

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <GeneralSection />
                <MarketSection />

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        Lancer le backtest
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}