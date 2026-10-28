"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AppField, type BaseProps } from "../field"

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
