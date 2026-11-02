"use client"

import { Plus, X } from "lucide-react"
import { useState } from "react"
import { type FieldValues, type FieldError as FormFieldError, useFormContext } from "react-hook-form"
import { AppField, type BaseProps } from "@/components/form/field"
import { SymbolPicker } from "@/components/symbol-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { FULL_PERCENT } from "./constants"
import type { AllocationInput } from "./types"
import { allocationTotal } from "./utils"

interface AllocationRowProps {
    row: AllocationInput
    inputId: string
    error?: FormFieldError // erreur propre au poids (vide, non entier, hors bornes)
    onWeightChange: (weight: number) => void
    onRemove: () => void
    onBlur: () => void
}

// Une ligne : symbole et nom, barre du poids, saisie en pourcent, retrait ; l'erreur du poids sous la ligne
function AllocationRow({ row, inputId, error, onWeightChange, onRemove, onBlur }: AllocationRowProps) {
    const width = Number.isNaN(row.weight) ? 0 : Math.min(Math.max(row.weight, 0), FULL_PERCENT)

    return (
        <>
            <div className="flex items-center gap-3">
                <Label htmlFor={inputId} className="w-40 min-w-0 flex-col items-start gap-1">
                    {row.symbol}
                    {row.name && (
                        <span className="truncate text-small font-normal text-muted-foreground">{row.name}</span>
                    )}
                </Label>
                <Progress value={width} size="md" className="flex-1" aria-hidden />
                <div className="flex items-center gap-1.5">
                    <Input
                        id={inputId}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={FULL_PERCENT}
                        step={1}
                        className="w-20 text-right"
                        aria-invalid={Boolean(error)}
                        value={Number.isNaN(row.weight) ? "" : row.weight}
                        onChange={(e) => onWeightChange(e.target.valueAsNumber)}
                        onBlur={onBlur}
                    />
                    <span className="text-body text-muted-foreground">%</span>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Retirer ${row.symbol}`}
                    onClick={onRemove}
                >
                    <X />
                </Button>
            </div>
            {error && <FieldError errors={[error]} />}
        </>
    )
}

// Bouton d'ajout et total saisi, vert à 100 %, rouge sinon (la validation reste au schéma)
function AllocationFooter({ total, addLabel, onAdd }: { total: number; addLabel: string; onAdd: () => void }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={onAdd}>
                <Plus />
                {addLabel}
            </Button>
            <Badge variant={total === FULL_PERCENT ? "success" : "destructive"} aria-live="polite">
                Total : {total} %
            </Badge>
        </div>
    )
}

/**
 * Champ de formulaire : allocation (`AllocationInput[]`), une `AllocationRow` par actif.
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
                            <AllocationFooter total={total} addLabel={addLabel} onAdd={() => setOpen(true)} />
                        </div>
                        <SymbolPicker
                            open={open}
                            onOpenChange={setOpen}
                            exclude={symbols}
                            title="Ajouter un actif"
                            onSelect={(item) => add(item.symbol, item.name)}
                        />
                    </>
                )
            }}
        </AppField>
    )
}
