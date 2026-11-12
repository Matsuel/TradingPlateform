"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { type FieldValues, useFormContext } from "react-hook-form"
import { AppField, type BaseProps } from "@/components/form/field"
import { SymbolPicker } from "@/components/symbol-picker"
import { AllocationFooter, AllocationRow } from "./allocation-row"
import { FULL_PERCENT } from "./constants"
import type { AllocationInput } from "./types"
import { allocationTotal } from "./utils"

/**
 * Champ de formulaire : allocation (`AllocationInput[]`), une `AllocationRow` par actif.
 * Le badge « Total » additionne la saisie pour l'affichage ; la validation (somme = 100) reste au schéma.
 * Un actif ajouté reçoit le reste jusqu'à 100 % (vide s'il n'en reste pas) ; un symbole déjà présent n'est pas ajouté.
 */
export function AllocationField<T extends FieldValues>({ addLabel, ...base }: BaseProps<T> & { addLabel?: string }) {
    const t = useTranslations("backtest.allocation")
    const [open, setOpen] = useState(false)
    const { getFieldState, formState } = useFormContext<T>()

    return (
        <AppField {...base}>
            {({ field, invalid }) => {
                const rows: AllocationInput[] = field.value ?? []
                const symbols = rows.map((r) => r.symbol)
                const total = allocationTotal(rows)
                const update = (symbol: string, weight: number) =>
                    field.onChange(rows.map((r) => (r.symbol === symbol ? { ...r, weight } : r)))
                const add = (symbol: string, name?: string) => {
                    if (symbols.includes(symbol)) return
                    const rest = FULL_PERCENT - total
                    field.onChange([...rows, { symbol, name, weight: rest > 0 ? rest : NaN }])
                }

                return (
                    <>
                        <div id={field.name} role="group" aria-label={base.label} className="grid gap-2">
                            {rows.map((row, i) => {
                                const inputId = `${field.name}.${i}.weight`
                                return (
                                    <AllocationRow
                                        key={row.symbol}
                                        row={row}
                                        inputId={inputId}
                                        error={
                                            invalid
                                                ? getFieldState(inputId as typeof field.name, formState).error
                                                : undefined
                                        }
                                        onWeightChange={(weight) => update(row.symbol, weight)}
                                        onRemove={() => field.onChange(rows.filter((r) => r.symbol !== row.symbol))}
                                        onBlur={field.onBlur}
                                    />
                                )
                            })}
                            <AllocationFooter
                                total={total}
                                addLabel={addLabel ?? t("add")}
                                onAdd={() => setOpen(true)}
                            />
                        </div>
                        <SymbolPicker
                            open={open}
                            onOpenChange={setOpen}
                            exclude={symbols}
                            title={t("add")}
                            onSelect={(item) => add(item.symbol, item.name)}
                        />
                    </>
                )
            }}
        </AppField>
    )
}
