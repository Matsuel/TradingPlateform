"use client"

import { CalendarIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Locale } from "@/i18n/config"
import { dateFnsLocales } from "@/i18n/date-locale"
import { useFormatters } from "@/lib/format"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    id?: string
    value: Date | undefined
    onChange: (date: Date | undefined) => void
    invalid?: boolean
    placeholder?: string
    disabled?: (d: Date) => boolean
}

/** Sélecteur de date seul (bouton + calendrier), hors formulaire ; `DateField` l'enveloppe pour react-hook-form. */
export function DatePicker({ id, value, onChange, invalid, placeholder, disabled }: DatePickerProps) {
    const t = useTranslations("components.dateField")
    const { formatDay } = useFormatters()
    const locale = useLocale() as Locale
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        aria-invalid={invalid}
                        className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
                    />
                }
            >
                {value ? formatDay(value) : (placeholder ?? t("placeholder"))}
                <CalendarIcon className="size-4 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    locale={dateFnsLocales[locale]}
                    selected={value}
                    onSelect={onChange}
                    disabled={disabled}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    )
}
