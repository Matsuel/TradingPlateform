"use client"

import type { ReactNode } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import Dash from "@/components/custom/Dash"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { dataProviderLabels, previewSteps, priceTypeLabels } from "./constants"
import { useBacktestPreview } from "./hook"
import { backtestSchema, type BacktestValues } from "./schema"

// Attente après la dernière saisie avant de redemander la prévisualisation
const PREVIEW_DEBOUNCE_MS = 500

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-start gap-4">
            <dt className="flex-1 text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}

/**
 * Carte « Récapitulatif » du formulaire « Nouveau backtest » (maquette 12.1), sous `FormProvider` d'un formulaire `BacktestValues` :
 * étapes d'une exécution, puis rebalancements et versements prévus et source des données renvoyés par `POST /api/backtest/preview`
 * (estimations calendaires du backend, appel débouncé). `<Dash />` tant que le formulaire est invalide ou la réponse absente.
 */
export function BacktestPreviewSummary() {
    const { control } = useFormContext<BacktestValues>()
    // compute + comparaison profonde de useWatch : la référence ne change que si les valeurs valides changent
    const values = useWatch({
        control,
        compute: (current) => {
            const parsed = backtestSchema.safeParse(current)
            return parsed.success ? parsed.data : null
        },
    })
    const { data } = useBacktestPreview(useDebouncedValue(values, PREVIEW_DEBOUNCE_MS))
    const preview = values ? data : undefined

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="text-body-semibold">Récapitulatif</CardTitle>
                <CardDescription className="text-small">Ce que lancera le backtest</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <ol className="grid gap-3 text-sm">
                    {previewSteps.map((step, i) => (
                        <li key={step.label} className="flex items-start gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                {i + 1}
                            </span>
                            <div>
                                <p className="font-medium">{step.label}</p>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <dl className="grid gap-2 border-t pt-4 text-sm">
                    <SummaryRow label="Rebalancements prévus">{preview ? preview.rebalanceCount : <Dash />}</SummaryRow>
                    <SummaryRow label="Versements prévus">{preview ? preview.contributionCount : <Dash />}</SummaryRow>
                    <SummaryRow label="Source des données">
                        {preview
                            ? `${dataProviderLabels[preview.dataSource.provider]} · ${priceTypeLabels[preview.dataSource.priceType]}`
                            : <Dash />}
                    </SummaryRow>
                </dl>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Estimation calendaire : jours ouvrés du lundi au vendredi, jours fériés inconnus avant le chargement des cours.
                </p>
            </CardFooter>
        </Card>
    )
}
