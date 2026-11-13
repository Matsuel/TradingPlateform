"use client"

import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { DatePicker } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useFormatters } from "@/lib/format"
import { MAX_START_DATES } from "./constants"
import { startDateIssue } from "./utils"

interface StartDatesProps {
    dates: (Date | undefined)[]
    onChange: (dates: (Date | undefined)[]) => void
    end: Date | undefined // fin commune des départs, base du refus « moins d'un an avant la fin »
    action?: ReactNode // bouton de validation, à droite du compteur (page du lot)
}

/**
 * Départ 1 à 10 d'un lot (maquettes 12 et 32) : une date par champ sur deux colonnes, refus affiché sous le champ fautif
 * (manquante, doublon, moins d'un an avant la fin), « Ajouter une date » et compteur « n / 10 dates ».
 * Contrôle d'ergonomie : le backend revérifie les dates avant tout calcul.
 */
export function StartDates({ dates, onChange, end, action }: StartDatesProps) {
    const t = useTranslations("backtest.startDates")
    const { formatDay } = useFormatters()

    const messageOf = (index: number) => {
        const issue = end ? startDateIssue(dates, index, end) : null
        // Une ligne ajoutée et encore vide n'est pas une erreur tant qu'on ne valide pas
        if (!issue || issue === "required") return null
        return t(issue, { end: end ? formatDay(end) : "" })
    }

    return (
        <div className="grid gap-4">
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                {dates.map((date, index) => {
                    const message = messageOf(index)
                    return (
                        // biome-ignore lint/suspicious/noArrayIndexKey: lignes sans identité, ordonnées par leur rang (Départ n)
                        <Field key={index} data-invalid={Boolean(message)}>
                            <FieldLabel htmlFor={`start-${index}`}>{t("label", { n: index + 1 })}</FieldLabel>
                            <DatePicker
                                id={`start-${index}`}
                                value={date}
                                invalid={Boolean(message)}
                                placeholder={t("placeholder")}
                                onChange={(next) => onChange(dates.map((d, i) => (i === index ? next : d)))}
                            />
                            {message && <FieldError>{message}</FieldError>}
                        </Field>
                    )
                })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    disabled={dates.length >= MAX_START_DATES}
                    onClick={() => onChange([...dates, undefined])}
                >
                    {t("add")}
                </Button>
                <span className="text-small text-muted-foreground">
                    {t("count", { count: dates.length, max: MAX_START_DATES })}
                </span>
                {action && <div className="ml-auto">{action}</div>}
            </div>
        </div>
    )
}
