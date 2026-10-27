"use client"

import { DateField, FieldRow, FormSection, NumberField, SelectField, TextField } from "@/components/form"

const strategies = [
    { value: "ma-cross", label: "Croisement de moyennes mobiles" },
    { value: "rsi", label: "RSI (surachat/survente)" },
    { value: "bollinger", label: "Bandes de Bollinger" },
    { value: "breakout", label: "Cassure de canal" },
]

export function GeneralSection() {
    return (
        <FormSection title="Général" description="Nom et stratégie à tester">
            <TextField name="name" label="Nom du backtest" />
            <SelectField name="strategy" label="Stratégie" options={strategies} />
            <FieldRow>
                <NumberField name="shortMa" label="Moyenne mobile courte" description="Nombre de bougies" />
                <NumberField name="longMa" label="Moyenne mobile longue" description="Nombre de bougies" />
            </FieldRow>
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