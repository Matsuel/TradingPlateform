"use client"

import type { ReactNode } from "react"
import {
    Controller,
    type ControllerRenderProps,
    type FieldPath,
    type FieldValues,
    useFormContext,
} from "react-hook-form"
import { InfoHint } from "@/components/info-hint"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import type { GlossaryKey } from "@/constants/glossary"

export type BaseProps<T extends FieldValues> = {
    name: FieldPath<T>
    label?: string
    hint?: GlossaryKey // libellé cliquable qui ouvre cette entrée du glossaire
    description?: string
    className?: string
}

export type RenderCtx<T extends FieldValues> = {
    field: ControllerRenderProps<T, FieldPath<T>>
    invalid: boolean
}

type Props<T extends FieldValues> = BaseProps<T> & {
    inline?: boolean // checkbox / switch : contrôle à côté du texte
    reverse?: boolean // switch : texte à gauche, contrôle à droite
    children: (ctx: RenderCtx<T>) => ReactNode
}

type FieldLayoutProps = Pick<Props<FieldValues>, "inline" | "reverse" | "className"> & {
    invalid: boolean
    label: ReactNode
    input: ReactNode
    details: ReactNode // description puis erreur
}

// Champ empilé (libellé au-dessus) ou en ligne (contrôle à côté du texte, à droite avec `reverse`)
function FieldLayout({ inline, reverse, className, invalid, label, input, details }: FieldLayoutProps) {
    if (!inline) {
        return (
            <Field data-invalid={invalid} className={className}>
                {label}
                {input}
                {details}
            </Field>
        )
    }
    const content = (
        <FieldContent>
            {label}
            {details}
        </FieldContent>
    )
    return (
        <Field orientation="horizontal" data-invalid={invalid} className={className}>
            {reverse ? content : input}
            {reverse ? input : content}
        </Field>
    )
}

/**
 * Champ react-hook-form du formulaire courant (`FormProvider`) : libellé (`InfoHint` si `hint`), description et erreur
 * autour du contrôle rendu par `children({ field, invalid })`.
 */
export function AppField<T extends FieldValues>({ name, label, hint, description, children, ...layout }: Props<T>) {
    const { control } = useFormContext<T>()

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FieldLayout
                    {...layout}
                    invalid={fieldState.invalid}
                    label={
                        label && (
                            <FieldLabel htmlFor={field.name}>
                                <InfoHint entry={hint}>{label}</InfoHint>
                            </FieldLabel>
                        )
                    }
                    input={children({ field, invalid: fieldState.invalid })}
                    details={
                        <>
                            {description && <FieldDescription>{description}</FieldDescription>}
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </>
                    }
                />
            )}
        />
    )
}
