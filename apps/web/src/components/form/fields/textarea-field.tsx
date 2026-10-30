"use client"

import type { FieldValues } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { AppField, type BaseProps } from "../field"

export function TextareaField<T extends FieldValues>({
    rows,
    placeholder,
    ...base
}: BaseProps<T> & { rows?: number; placeholder?: string }) {
    return (
        <AppField {...base}>
            {({ field, invalid }) => (
                <Textarea {...field} id={field.name} rows={rows} placeholder={placeholder} aria-invalid={invalid} />
            )}
        </AppField>
    )
}
