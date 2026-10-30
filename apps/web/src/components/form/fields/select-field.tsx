"use client"

import type { FieldValues } from "react-hook-form"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppField, type BaseProps } from "../field"

export function SelectField<T extends FieldValues>({
    options,
    placeholder = "Sélectionner…",
    ...base
}: BaseProps<T> & { options: { value: string; label: string }[]; placeholder?: string }) {
    return (
        <AppField {...base}>
            {({ field, invalid }) => (
                <Select
                    value={field.value || null}
                    onValueChange={(v) => field.onChange(v ?? "")}
                >
                    <SelectTrigger id={field.name} aria-invalid={invalid} className="w-full">
                        <SelectValue placeholder={placeholder}>
                            {(value: string | null) =>
                                options.find((o) => o.value === value)?.label ?? placeholder
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </AppField>
    )
}
