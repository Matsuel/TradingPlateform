"use client"

import type { FieldValues } from "react-hook-form"

import { Switch } from "@/components/ui/switch"
import { AppField, BaseProps } from "../field"

export function SwitchField<T extends FieldValues>(base: BaseProps<T>) {
    return (
        <AppField inline reverse {...base}>
            {({ field, invalid }) => (
                <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} aria-invalid={invalid} />
            )}
        </AppField>
    )
}
