"use client"

import type { FieldValues } from "react-hook-form"
import { AppField, type BaseProps } from "../field"
import { DatePicker } from "./date-picker"

export function DateField<T extends FieldValues>({
    placeholder,
    disabled,
    ...base
}: BaseProps<T> & { placeholder?: string; disabled?: (d: Date) => boolean }) {
    return (
        <AppField {...base}>
            {({ field, invalid }) => (
                <DatePicker
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={invalid}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            )}
        </AppField>
    )
}
