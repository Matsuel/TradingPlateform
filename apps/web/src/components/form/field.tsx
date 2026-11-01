"use client"

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
    children: (ctx: RenderCtx<T>) => React.ReactNode
}

export function AppField<T extends FieldValues>({
    name,
    label,
    hint,
    description,
    className,
    inline,
    reverse,
    children,
}: Props<T>) {
    const { control } = useFormContext<T>()

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                const invalid = fieldState.invalid
                const input = children({ field, invalid })
                const labelEl = label && (
                    <FieldLabel htmlFor={field.name}>
                        <InfoHint entry={hint}>{label}</InfoHint>
                    </FieldLabel>
                )
                const descEl = description && <FieldDescription>{description}</FieldDescription>
                const errorEl = invalid && <FieldError errors={[fieldState.error]} />

                if (inline) {
                    const text = (
                        <FieldContent>
                            {labelEl}
                            {descEl}
                            {errorEl}
                        </FieldContent>
                    )
                    return (
                        <Field orientation="horizontal" data-invalid={invalid} className={className}>
                            {reverse ? (
                                <>
                                    {text}
                                    {input}
                                </>
                            ) : (
                                <>
                                    {input}
                                    {text}
                                </>
                            )}
                        </Field>
                    )
                }

                return (
                    <Field data-invalid={invalid} className={className}>
                        {labelEl}
                        {input}
                        {descEl}
                        {errorEl}
                    </Field>
                )
            }}
        />
    )
}
