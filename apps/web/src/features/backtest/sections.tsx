"use client"

import { useWatch } from "react-hook-form"

import { DateField, FieldRow, FormSection, NumberField, SelectField, SymbolsField, TextField } from "@/components/form"
import { strategyOptions } from "./constants"

export function GeneralSection() {
    return (
        <FormSection title="Général" description="Nom et stratégie à tester">
            <TextField name="name" label="Nom du backtest" />
            <SelectField name="strategy" label="Stratégie" options={strategyOptions} />
        </FormSection>
    )
}

export function MarketSection() {
    const strategy = useWatch({ name: "strategy" })

    return (
        <FormSection title="Marché et période" description="Symboles et fenêtre historique">
            <SymbolsField name="symbols" label="Symboles" />
            <FieldRow>
                <DateField name="start" label="Début" />
                <DateField name="end" label="Fin" />
            </FieldRow>
            <FieldRow>
                <NumberField
                    name="amount"
                    label={strategy === "lump_sum" ? "Montant investi (€)" : "Montant investi chaque mois (€)"}
                />
                <NumberField name="fee" label="Frais par ordre (%)" />
            </FieldRow>
        </FormSection>
    )
}