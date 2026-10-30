"use client"

import type { FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { AppField, type BaseProps } from "../field"

export function TextField<T extends FieldValues>({
    type = "text",
    placeholder,
    ...base
}: BaseProps<T> & { type?: "text" | "email" | "password"; placeholder?: string }) {
    return (
        <AppField {...base}>
            {({ field, invalid }) => (
                <Input {...field} id={field.name} type={type} placeholder={placeholder} aria-invalid={invalid} />
            )}
        </AppField>
    )
}
