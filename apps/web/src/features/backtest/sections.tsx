"use client"

import { useTranslations } from "next-intl"
import { useWatch } from "react-hook-form"
import { DateField, FieldRow, FormSection, NumberField, SelectField, SymbolsField, TextField } from "@/components/form"
import { useFormatters } from "@/lib/format"
import { AllocationField } from "./allocation-field"
import { BACKTEST_CURRENCY, investmentModes, rebalanceFrequencies } from "./constants"
import type { InvestmentMode } from "./types"

// Champs communs au formulaire « Nouveau backtest » et au test rapide, sous `FormProvider`

/** Mode d'investissement et, en `RECURRING` seulement, le versement mensuel. */
export function InvestmentModeFields() {
    const t = useTranslations("backtest.form")
    const tMode = useTranslations("backtest.investmentMode")
    const currency = useFormatters().currencySymbol(BACKTEST_CURRENCY)
    // Partagé par deux formulaires : seul `investmentMode` est lu, typé ici
    const investmentMode = useWatch<{ investmentMode: InvestmentMode }>({ name: "investmentMode" })

    return (
        <>
            <SelectField
                name="investmentMode"
                label={t("investmentMode")}
                hint="investmentMode"
                options={investmentModes.map((value) => ({ value, label: tMode(value) }))}
            />
            {investmentMode === "RECURRING" && (
                <NumberField name="recurringAmount" label={t("recurringAmount", { currency })} />
            )}
        </>
    )
}

/** Période (début, fin), puis capital initial et frais par ordre. */
export function PeriodAndCapitalFields() {
    const t = useTranslations("backtest.form")
    const currency = useFormatters().currencySymbol(BACKTEST_CURRENCY)

    return (
        <>
            <FieldRow>
                <DateField name="start" label={t("start")} />
                <DateField name="end" label={t("end")} />
            </FieldRow>
            <FieldRow>
                <NumberField name="initialAmount" label={t("initialAmount", { currency })} />
                <NumberField name="fee" label={t("fee")} hint="feeRate" />
            </FieldRow>
        </>
    )
}

/** Section « Général » du formulaire : nom, mode d'investissement et versement mensuel. */
export function GeneralSection() {
    const t = useTranslations("backtest.form")

    return (
        <FormSection title={t("general.title")} description={t("general.description")}>
            <TextField name="name" label={t("name")} />
            <InvestmentModeFields />
        </FormSection>
    )
}

/** Section « Allocation et période » : actifs et poids, période, capital, frais, rebalancement et benchmark. */
export function AllocationSection() {
    const t = useTranslations("backtest.form")
    const tFrequency = useTranslations("backtest.rebalanceFrequency")

    return (
        <FormSection title={t("allocationSection.title")} description={t("allocationSection.description")}>
            <AllocationField name="allocations" label={t("allocations")} hint="allocation" />
            <PeriodAndCapitalFields />
            <SelectField
                name="rebalanceFrequency"
                label={t("rebalance")}
                hint="rebalanceFrequency"
                description={t("rebalanceDescription")}
                options={rebalanceFrequencies.map((value) => ({ value, label: tFrequency(value) }))}
            />
            <SymbolsField
                name="benchmarkSymbols"
                label={t("benchmark")}
                hint="benchmark"
                description={t("benchmarkDescription")}
                max={1}
                addLabel={t("benchmarkAdd")}
            />
        </FormSection>
    )
}
