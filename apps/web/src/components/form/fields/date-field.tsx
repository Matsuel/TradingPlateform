"use client"

import { CalendarIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { FieldValues } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Locale } from "@/i18n/config"
import { dateFnsLocales } from "@/i18n/date-locale"
import { useFormatters } from "@/lib/format"
import { cn } from "@/lib/utils"
import { AppField, type BaseProps } from "../field"

export function DateField<T extends FieldValues>({
    placeholder,
    disabled,
    ...base
}: BaseProps<T> & { placeholder?: string; disabled?: (d: Date) => boolean }) {
    const t = useTranslations("components.dateField")
    const { formatDay } = useFormatters()
    const locale = useLocale() as Locale
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
                                className={cn(
                                    "w-full justify-between font-normal",
                                    !field.value && "text-muted-foreground",
                                )}
                            />
                        }
                    >
                        {field.value ? formatDay(field.value) : (placeholder ?? t("placeholder"))}
                        <CalendarIcon className="size-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            locale={dateFnsLocales[locale]}
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
