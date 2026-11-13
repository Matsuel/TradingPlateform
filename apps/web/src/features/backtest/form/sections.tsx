"use client"

import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import {
    DateField,
    FieldRow,
    FormSection,
    NumberField,
    SelectField,
    SwitchField,
    SymbolsField,
    TextField,
} from "@/components/form"
import { useFormatters } from "@/lib/format"
import { AllocationField } from "./allocation-field"
import { BACKTEST_CURRENCY, investmentModes, rebalanceFrequencies } from "./constants"
import type { BacktestValues } from "./schema"
import { StartDates } from "./start-dates"
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

/** Période (début, fin), `afterPeriod` (ex. lot de départs), puis capital initial et frais par ordre. */
export function PeriodAndCapitalFields({ afterPeriod }: { afterPeriod?: ReactNode }) {
    const t = useTranslations("backtest.form")
    const currency = useFormatters().currencySymbol(BACKTEST_CURRENCY)

    return (
        <>
            <FieldRow>
                <DateField name="start" label={t("start")} />
                <DateField name="end" label={t("end")} />
            </FieldRow>
            {afterPeriod}
            <FieldRow>
                <NumberField name="initialAmount" label={t("initialAmount", { currency })} />
                <NumberField name="fee" label={t("fee")} hint="feeRate" />
            </FieldRow>
        </>
    )
}

/**
 * Interrupteur « Plusieurs dates de départ » (maquette 12) et, allumé, les départs du lot : `start` (Début) est le Départ 1,
 * les suivants sont `extraStartDates`. Réservé au formulaire complet (valeurs `BacktestValues`).
 */
export function StartDatesFields() {
    const t = useTranslations("backtest.form")
    const { control, setValue } = useFormContext<BacktestValues>()
    const [multipleStarts, start, extra, end] = useWatch({
        control,
        name: ["multipleStarts", "start", "extraStartDates", "end"],
    })

    return (
        <>
            <SwitchField
                name="multipleStarts"
                label={t("multipleStarts")}
                description={t("multipleStartsDescription")}
            />
            {multipleStarts && (
                <StartDates
                    dates={[start, ...extra.map(({ date }) => date)]}
                    end={end}
                    onChange={([first, ...others]) => {
                        setValue("start", first as Date, { shouldValidate: true })
                        setValue(
                            "extraStartDates",
                            others.map((date) => ({ date: date as Date })),
                            { shouldValidate: true },
                        )
                    }}
                />
            )}
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
            <PeriodAndCapitalFields afterPeriod={<StartDatesFields />} />
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
