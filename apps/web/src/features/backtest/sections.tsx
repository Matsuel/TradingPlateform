"use client"

import { useWatch } from "react-hook-form"

import { AllocationField, DateField, FieldRow, FormSection, NumberField, SelectField, TextField } from "@/components/form"
import { investmentModeOptions, rebalanceFrequencyOptions } from "./constants"

export function GeneralSection() {
    const investmentMode = useWatch({ name: "investmentMode" })

    return (
        <FormSection title="Général" description="Nom et mode d’investissement">
            <TextField name="name" label="Nom du backtest" />
            <SelectField name="investmentMode" label="Mode d’investissement" options={investmentModeOptions} />
            {investmentMode === "RECURRING" && <NumberField name="recurringAmount" label="Versement mensuel (€)" />}
        </FormSection>
    )
}

export function AllocationSection() {
    return (
        <FormSection title="Allocation et période" description="Actifs, poids et fenêtre historique">
            <AllocationField name="allocations" label="Actifs et poids" />
            <FieldRow>
                <DateField name="start" label="Début" />
                <DateField name="end" label="Fin" />
            </FieldRow>
            <FieldRow>
                <NumberField name="initialAmount" label="Capital initial (€)" />
                <NumberField name="fee" label="Frais par ordre (%)" />
            </FieldRow>
            <SelectField
                name="rebalanceFrequency"
                label="Rebalancement"
                description="Ramène les poids à la cible"
                options={rebalanceFrequencyOptions}
            />
        </FormSection>
    )
}
