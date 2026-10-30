"use client"

import type { FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { AppField, type BaseProps } from "../field"

export function NumberField<T extends FieldValues>({
    placeholder,
    ...base
}: BaseProps<T> & { placeholder?: string }) {
    return (
        <AppField {...base}>
            {({ field, invalid }) => (
                <Input
                    {...field}
                    id={field.name}
                    type="number"
                    placeholder={placeholder}
                    aria-invalid={invalid}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                />
            )}
        </AppField>
    )
}
