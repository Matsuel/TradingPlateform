"use client"

import { DateField, FieldRow, FormSection, NumberField, SelectField, TextField } from "@/components/form"

const strategies = [
    { value: "dca", label: "Simulation DCA dans le passé" }
]

export function GeneralSection() {
    return (
        <FormSection title="Général" description="Nom et stratégie à tester">
            <TextField name="name" label="Nom du backtest" />
            <SelectField name="strategy" label="Stratégie" options={strategies} />
        </FormSection>
    )
}

export function MarketSection() {
    return (
        <FormSection title="Marché et période" description="Symboles et fenêtre historique">
            <FieldRow>
                <DateField name="start" label="Début" />
                <DateField name="end" label="Fin" />
            </FieldRow>
            <FieldRow>
                <NumberField name="capital" label="Capital initial (€)" />
                <NumberField name="fee" label="Frais par ordre (%)" />
            </FieldRow>
        </FormSection>
    )
}