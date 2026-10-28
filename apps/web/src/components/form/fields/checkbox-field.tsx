"use client"

import type { FieldValues } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { AppField, type BaseProps } from "../field"

export function CheckboxField<T extends FieldValues>(base: BaseProps<T>) {
    return (
        <AppField inline {...base}>
            {({ field, invalid }) => (
                <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} aria-invalid={invalid} />
            )}
        </AppField>
    )
}
