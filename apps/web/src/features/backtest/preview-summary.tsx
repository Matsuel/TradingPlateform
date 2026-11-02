"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { Dash } from "@/components/dash"
import { DetailRow } from "@/components/detail-row"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { dataProviderLabels, previewSteps, priceTypeLabels } from "./constants"
import { useBacktestPreview } from "./hook"
import { type BacktestValues, backtestSchema } from "./schema"

// Attente après la dernière saisie avant de redemander la prévisualisation
const PREVIEW_DEBOUNCE_MS = 500

/**
 * Carte « Récapitulatif » du formulaire « Nouveau backtest » (maquette 12), sous `FormProvider` d'un formulaire `BacktestValues` :
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
        <Card size="compact">
            <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
                <CardDescription>Ce que lancera le backtest</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <ol className="grid gap-3 text-body">
                    {previewSteps.map((step, i) => (
                        <li key={step.label} className="flex items-start gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-small-medium">
                                {i + 1}
                            </span>
                            <div>
                                <p className="font-medium">{step.label}</p>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <dl className="grid gap-2 border-t pt-4 text-body">
                    <DetailRow label="Rebalancements prévus" hint="plannedRebalances">
                        {preview ? preview.rebalanceCount : <Dash />}
                    </DetailRow>
                    <DetailRow label="Versements prévus" hint="plannedContributions">
                        {preview ? preview.contributionCount : <Dash />}
                    </DetailRow>
                    <DetailRow label="Source des données" hint="dataSource">
                        {preview ? (
                            `${dataProviderLabels[preview.dataSource.provider]} · ${priceTypeLabels[preview.dataSource.priceType]}`
                        ) : (
                            <Dash />
                        )}
                    </DetailRow>
                </dl>
            </CardContent>
            <CardFooter>
                <p className="text-small text-muted-foreground">
                    Estimation calendaire : jours ouvrés du lundi au vendredi, jours fériés inconnus avant le chargement
                    des cours.
                </p>
            </CardFooter>
        </Card>
    )
}
