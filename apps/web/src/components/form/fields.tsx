"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AppField, BaseProps } from "./field"

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

export function DateField<T extends FieldValues>({
    placeholder = "jj/mm/aaaa",
    disabled,
    ...base
}: BaseProps<T> & { placeholder?: string; disabled?: (d: Date) => boolean }) {
    return (
        <AppField {...base}>
            {({ field, invalid }) => (
                <Popover>
                    <PopoverTrigger
                        render={
                            <Button
                                id={field.name}
                                type="button"
                                variant="outline"
                                aria-invalid={invalid}
                                className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                            />
                        }
                    >
                        {field.value ? format(field.value, "dd/MM/yyyy") : placeholder}
                        <CalendarIcon className="size-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            locale={fr}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={disabled}
                            autoFocus
                        />
                    </PopoverContent>
                </Popover>
            )}
        </AppField>
    )
}

export function CheckboxField<T extends FieldValues>(base: BaseProps<T>) {
    return (
        <AppField inline {...base}>
            {({ field, invalid }) => (
                <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} aria-invalid={invalid} />
            )}
        </AppField>
    )
}

export function SwitchField<T extends FieldValues>(base: BaseProps<T>) {
    return (
        <AppField inline reverse {...base}>
            {({ field, invalid }) => (
                <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} aria-invalid={invalid} />
            )}
        </AppField>
    )
}