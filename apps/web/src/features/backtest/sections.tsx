"use client"

import { useWatch } from "react-hook-form"
import { DateField, FieldRow, FormSection, NumberField, SelectField, SymbolsField, TextField } from "@/components/form"
import { currencySymbol } from "@/lib/format"
import { AllocationField } from "./allocation-field"
import { BACKTEST_CURRENCY, investmentModeOptions, rebalanceFrequencyOptions } from "./constants"
import type { InvestmentMode } from "./types"

const currency = currencySymbol(BACKTEST_CURRENCY)

// Champs communs au formulaire « Nouveau backtest » et au test rapide, sous `FormProvider`

/** Mode d'investissement et, en `RECURRING` seulement, le versement mensuel. */
export function InvestmentModeFields() {
    // Partagé par deux formulaires : seul `investmentMode` est lu, typé ici
    const investmentMode = useWatch<{ investmentMode: InvestmentMode }>({ name: "investmentMode" })

    return (
        <>
            <SelectField
                name="investmentMode"
                label="Mode d’investissement"
                hint="investmentMode"
                options={investmentModeOptions}
            />
            {investmentMode === "RECURRING" && (
                <NumberField name="recurringAmount" label={`Versement mensuel (${currency})`} />
            )}
        </>
    )
}

/** Période (début, fin), puis capital initial et frais par ordre. */
export function PeriodAndCapitalFields() {
    return (
        <>
            <FieldRow>
                <DateField name="start" label="Début" />
                <DateField name="end" label="Fin" />
            </FieldRow>
            <FieldRow>
                <NumberField name="initialAmount" label={`Capital initial (${currency})`} />
                <NumberField name="fee" label="Frais par ordre (%)" hint="feeRate" />
            </FieldRow>
        </>
    )
}

/** Section « Général » du formulaire : nom, mode d'investissement et versement mensuel. */
export function GeneralSection() {
    return (
        <FormSection title="Général" description="Nom et mode d’investissement">
            <TextField name="name" label="Nom du backtest" />
            <InvestmentModeFields />
        </FormSection>
    )
}

/** Section « Allocation et période » : actifs et poids, période, capital, frais, rebalancement et benchmark. */
export function AllocationSection() {
    return (
        <FormSection title="Allocation et période" description="Actifs, poids et fenêtre historique">
            <AllocationField name="allocations" label="Actifs et poids" hint="allocation" />
            <PeriodAndCapitalFields />
            <SelectField
                name="rebalanceFrequency"
                label="Rebalancement"
                hint="rebalanceFrequency"
                description="Ramène les poids à la cible"
                options={rebalanceFrequencyOptions}
            />
            <SymbolsField
                name="benchmarkSymbols"
                label="Benchmark"
                hint="benchmark"
                description="Rejoué avec les mêmes versements et frais ; retire-le pour simuler sans benchmark"
                max={1}
                addLabel="Choisir"
            />
        </FormSection>
    )
}
