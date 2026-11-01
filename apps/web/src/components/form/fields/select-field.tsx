"use client"

import type { FieldValues } from "react-hook-form"
import { OptionSelect, type SelectOption } from "@/components/option-select"
import { AppField, type BaseProps } from "../field"

/** Champ de formulaire : une valeur parmi `options` (`OptionSelect`) ; valeur vide = aucune option choisie. */
export function SelectField<T extends FieldValues>({
    options,
    placeholder,
    ...base
}: BaseProps<T> & { options: SelectOption[]; placeholder?: string }) {
    return (
        <AppField {...base}>
            {({ field, invalid }) => (
                <OptionSelect
                    id={field.name}
                    value={field.value ?? ""}
                    options={options}
                    onChange={field.onChange}
                    placeholder={placeholder}
                    invalid={invalid}
                />
            )}
        </AppField>
    )
}
