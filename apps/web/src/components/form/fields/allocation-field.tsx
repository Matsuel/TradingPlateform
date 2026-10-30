"use client"

import { Fragment, useState } from "react"
import { Plus, X } from "lucide-react"
import { useFormContext, type FieldValues } from "react-hook-form"
import type { Allocation } from "@trading-plateform/contracts"

import { Badge } from "@/components/ui/badge"
import { FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SymbolPicker } from "@/components/symbol-picker"
import { AppField, type BaseProps } from "../field"

// Poids saisi en pourcent entier (60 = 60 %, D2), converti en ratio par le schéma d'entrée du backend ; NaN = champ vidé
export type AllocationInput = Pick<Allocation, "symbol"> & { name?: string; weight: number }

export const FULL_PERCENT = 100

/** Somme des poids saisis, en pourcent ; un poids vidé (`NaN`) compte 0 (le schéma du formulaire le rejette à part). */
export function allocationTotal(rows: AllocationInput[]): number {
    return rows.reduce((sum, r) => sum + (Number.isNaN(r.weight) ? 0 : r.weight), 0)
}

/**
 * Champ de formulaire : allocation (`AllocationInput[]`), une ligne par actif avec barre et poids en pourcent entier.
 * Le badge « Total » additionne la saisie pour l'affichage ; la validation (somme = 100) reste au schéma.
 * Un actif ajouté reçoit le reste jusqu'à 100 % (vide s'il n'en reste pas) ; un symbole déjà présent n'est pas ajouté.
 */
export function AllocationField<T extends FieldValues>({
    addLabel = "Ajouter un actif",
    ...base
}: BaseProps<T> & { addLabel?: string }) {
    const [open, setOpen] = useState(false)
    const { getFieldState, formState } = useFormContext<T>()

    return (
        <AppField {...base}>
            {({ field, invalid }) => {
                const rows: AllocationInput[] = field.value ?? []
                const symbols = rows.map((r) => r.symbol)
                const total = allocationTotal(rows)
                const rest = FULL_PERCENT - total

                const setWeight = (symbol: string, weight: number) =>
                    field.onChange(rows.map((r) => (r.symbol === symbol ? { ...r, weight } : r)))

                return (
                    <>
                        <div id={field.name} role="group" aria-label={base.label} className="grid gap-2">
                            {rows.map((row, i) => {
                                const inputId = `${field.name}.${i}.weight`
                                // Erreur propre au poids (vide, non entier, hors bornes) : affichée sous sa ligne, le message global ne la porte pas
                                const rowError = invalid ? getFieldState(inputId as typeof field.name, formState).error : undefined
                                const width = Number.isNaN(row.weight) ? 0 : Math.min(Math.max(row.weight, 0), FULL_PERCENT)

                                return (
                                    <Fragment key={row.symbol}>
                                        <div className="flex items-center gap-3">
                                            <label htmlFor={inputId} className="w-40 min-w-0">
                                                <p className="text-sm font-medium">{row.symbol}</p>
                                                {row.name && <p className="truncate text-xs text-muted-foreground">{row.name}</p>}
                                            </label>
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Input
                                                    id={inputId}
                                                    type="number"
                                                    inputMode="numeric"
                                                    min={1}
                                                    max={FULL_PERCENT}
                                                    step={1}
                                                    className="w-20 text-right"
                                                    aria-invalid={!!rowError}
                                                    value={Number.isNaN(row.weight) ? "" : row.weight}
                                                    onChange={(e) => setWeight(row.symbol, e.target.valueAsNumber)}
                                                    onBlur={field.onBlur}
                                                />
                                                <span className="text-sm text-muted-foreground">%</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Retirer ${row.symbol}`}
                                                onClick={() => field.onChange(rows.filter((r) => r.symbol !== row.symbol))}
                                            >
                                                <X />
                                            </Button>
                                        </div>
                                        {rowError && <FieldError errors={[rowError]} />}
                                    </Fragment>
                                )
                            })}
                            <div className="flex items-center justify-between gap-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(true)}>
                                    <Plus />
                                    {addLabel}
                                </Button>
                                <Badge variant={total === FULL_PERCENT ? "success" : "destructive"} aria-live="polite">
                                    Total : {total} %
                                </Badge>
                            </div>
                        </div>
                        <SymbolPicker
                            open={open}
                            onOpenChange={setOpen}
                            exclude={symbols}
                            title="Ajouter un actif"
                            onSelect={(item) => {
                                if (symbols.includes(item.symbol)) return
                                field.onChange([...rows, { symbol: item.symbol, name: item.name, weight: rest > 0 ? rest : NaN }])
                            }}
                        />
                    </>
                )
            }}
        </AppField>
    )
}
