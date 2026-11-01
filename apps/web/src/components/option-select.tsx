"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type SelectOption = { value: string; label: string }

interface OptionSelectProps {
    id?: string
    value: string // `""` : aucune option choisie, `placeholder` affiché
    options: SelectOption[]
    onChange: (value: string) => void
    placeholder?: string
    invalid?: boolean
}

/** Liste déroulante d'options `{ value, label }` pleine largeur, affichant le libellé de la valeur choisie. */
export function OptionSelect({
    id,
    value,
    options,
    onChange,
    placeholder = "Sélectionner…",
    invalid,
}: OptionSelectProps) {
    return (
        <Select value={value || null} onValueChange={(v) => onChange(v ?? "")}>
            <SelectTrigger id={id} aria-invalid={invalid} className="w-full">
                <SelectValue placeholder={placeholder}>
                    {(v: string | null) => options.find((o) => o.value === v)?.label ?? placeholder}
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
    )
}
