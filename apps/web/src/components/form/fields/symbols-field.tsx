"use client"

import { X } from "lucide-react"
import { useState } from "react"
import type { FieldValues } from "react-hook-form"
import { SymbolPicker } from "@/components/symbol-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppField, type BaseProps } from "../field"

/** Champ de formulaire : liste de symboles (string[]) affichés en chips, ajout via recherche. */
export function SymbolsField<T extends FieldValues>({
    max,
    addLabel = "Ajouter",
    ...base
}: BaseProps<T> & { max?: number; addLabel?: string }) {
    const [open, setOpen] = useState(false)

    return (
        <AppField {...base}>
            {({ field, invalid }) => {
                const symbols: string[] = field.value ?? []
                const full = max !== undefined && symbols.length >= max

                return (
                    <>
                        <div id={field.name} className="flex flex-wrap items-center gap-2" aria-invalid={invalid}>
                            {symbols.map((symbol) => (
                                <Badge key={symbol} variant="outline" size="lg">
                                    {symbol}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label={`Retirer ${symbol}`}
                                        onClick={() => field.onChange(symbols.filter((s) => s !== symbol))}
                                    >
                                        <X />
                                    </Button>
                                </Badge>
                            ))}
                            <Button type="button" variant="outline" disabled={full} onClick={() => setOpen(true)}>
                                {addLabel}
                            </Button>
                        </div>
                        <SymbolPicker
                            open={open}
                            onOpenChange={setOpen}
                            exclude={symbols}
                            title="Ajouter un symbole"
                            onSelect={(item) => field.onChange([...symbols, item.symbol])}
                        />
                    </>
                )
            }}
        </AppField>
    )
}
