"use client"

import { Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FieldError as FormFieldError } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { FULL_PERCENT } from "../constants"
import type { AllocationInput } from "../types"

interface AllocationRowProps {
    row: AllocationInput
    inputId: string
    error?: FormFieldError // erreur propre au poids (vide, non entier, hors bornes)
    onWeightChange: (weight: number) => void
    onRemove: () => void
    onBlur: () => void
}

// Une ligne : symbole et nom, barre du poids, saisie en pourcent, retrait ; l'erreur du poids sous la ligne
export function AllocationRow({ row, inputId, error, onWeightChange, onRemove, onBlur }: AllocationRowProps) {
    const t = useTranslations("backtest.allocation")
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
                    aria-label={t("remove", { symbol: row.symbol })}
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
export function AllocationFooter({ total, addLabel, onAdd }: { total: number; addLabel: string; onAdd: () => void }) {
    const t = useTranslations("backtest.allocation")

    return (
        <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={onAdd}>
                <Plus />
                {addLabel}
            </Button>
            <Badge variant={total === FULL_PERCENT ? "success" : "destructive"} aria-live="polite">
                {t("total", { total })}
            </Badge>
        </div>
    )
}
