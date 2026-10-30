"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { FieldValues } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SymbolPicker } from "@/components/symbol-picker"
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
                                <Badge key={symbol} variant="outline" className="h-auto py-1 gap-1.5 px-2 text-xs">
                                    {symbol}
                                    <button
                                        type="button"
                                        aria-label={`Retirer ${symbol}`}
                                        className="rounded-full text-muted-foreground hover:text-foreground"
                                        onClick={() => field.onChange(symbols.filter((s) => s !== symbol))}
                                    >
                                        <X className="cursor-pointer" width={12} height={12} />
                                    </button>
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
