"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TriangleAlert } from "lucide-react"
import PageHeader from "@/components/page-layout/header"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDayRange, formatPercent } from "@/lib/format"
import { prefix } from "@/lib/path"
import { comparisonParameterLabels, NO_BENCHMARK_LABEL } from "./constants"
import { ComparisonMetrics, ComparisonParameters } from "./comparison-blocks"
import { ComparisonOverview } from "./comparison-overview"
import { ComparisonSelection } from "./comparison-selection"
import { useBacktestComparison } from "./hook"
import type { BacktestComparison, ComparisonParameter } from "./types"

// Une phrase par paramètre qui diffère, valeurs de A puis de B
const differenceDetails: Record<ComparisonParameter, (c: BacktestComparison) => string> = {
    period: ({ a, b }) => `A couvre ${formatDayRange(a.startDate, a.endDate)}, B ${formatDayRange(b.startDate, b.endDate)}.`,
    feeRate: ({ a, b }) => `A paie ${formatPercent(Number(a.feeRate))} par ordre, B ${formatPercent(Number(b.feeRate))}.`,
    benchmarkSymbol: ({ a, b }) => `Benchmark de A : ${a.benchmarkSymbol ?? NO_BENCHMARK_LABEL}, de B : ${b.benchmarkSymbol ?? NO_BENCHMARK_LABEL}.`,
}

// Bandeau affiché quand le backend signale une comparaison non homogène
function HeterogeneityBanner({ comparison }: { comparison: BacktestComparison }) {
    const { differences } = comparison
    return (
        <div role="status" className="flex items-start gap-3 rounded-md border bg-muted px-4 py-3.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
                <p className="text-body-semibold">
                    Comparaison non homogène : {differences.map((d) => comparisonParameterLabels[d]).join(", ")}
                </p>
                <p className="text-small text-muted-foreground">
                    {differences.map((d) => differenceDetails[d](comparison)).join(" ")} Les écarts restent calculés, mais ne mesurent
                    plus seulement l’effet de l’allocation.
                </p>
            </div>
        </div>
    )
}

/**
 * Écran de comparaison de deux backtests terminés (maquette 19 v2) : sélection de A et B gardée dans l'URL (`?ids=a,b`),
 * bandeau si la comparaison n'est pas homogène, courbes de valeur et de drawdown, métriques comparées et paramètres.
 * Écarts et homogénéité viennent de `GET /api/backtest/compare` ; `ids` : valeur brute du paramètre de l'URL.
 */
export function BacktestCompare({ ids }: { ids: string | string[] | undefined }) {
    const router = useRouter()
    const [a = "", b = ""] = String(ids ?? "").split(",")
    const { data: comparison, isPending, isError, error, refetch } = useBacktestComparison(a, b)
    const [copied, setCopied] = useState(false)

    const select = (nextA: string, nextB: string) => {
        setCopied(false)
        router.replace(`${prefix}/backtest/compare?ids=${nextA},${nextB}`, { scroll: false })
    }
    const copyLink = () => navigator.clipboard.writeText(window.location.href).then(() => setCopied(true))

    let content
    if (!a || !b) {
        content = (
            <Card>
                <CardContent className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    Choisissez deux backtests terminés à comparer.
                </CardContent>
            </Card>
        )
    } else if (isError) {
        content = <ErrorState message={error.message} onRetry={refetch} className="h-64" />
    } else if (isPending) {
        content = <LoadingState className="h-64" />
    } else {
        content = (
            <>
                {!comparison.homogeneous && <HeterogeneityBanner comparison={comparison} />}
                <ComparisonOverview comparison={comparison} />
                <div className="grid gap-4 xl:grid-cols-2">
                    <ComparisonMetrics comparison={comparison} />
                    <ComparisonParameters comparison={comparison} />
                </div>
            </>
        )
    }

    return (
        <>
            <PageHeader
                title="Comparaison"
                description="Deux backtests terminés, mêmes métriques côte à côte"
                actions={<Button variant="outline" onClick={copyLink} disabled={!comparison}>{copied ? "Lien copié" : "Copier le lien"}</Button>}
            />
            <ComparisonSelection a={a} b={b} onChange={select} />
            {content}
        </>
    )
}
