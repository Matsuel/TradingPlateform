"use client"

import { TriangleAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { EmptyCard } from "@/components/empty-card"
import { PageHeader } from "@/components/page-layout"
import { ErrorState, LoadingState } from "@/components/query-status"
import { Button } from "@/components/ui/button"
import { useApiErrorMessages } from "@/lib/api-error"
import { type Formatters, useFormatters } from "@/lib/format"
import { routes } from "@/lib/routes"
import { useBacktestComparison } from "../hook"
import type { BacktestComparison, ComparisonParameter } from "../types"
import type { BacktestTranslator } from "../utils"
import { ComparisonMetrics } from "./comparison-metrics"
import { ComparisonOverview } from "./comparison-overview"
import { ComparisonParameters } from "./comparison-parameters"
import { ComparisonSelection } from "./comparison-selection"

// Une phrase par paramètre qui diffère, valeurs de A puis de B
const differenceDetails: Record<
    ComparisonParameter,
    (c: BacktestComparison, f: Formatters, t: BacktestTranslator) => string
> = {
    period: ({ a, b }, f, t) =>
        t("compare.details.period", {
            a: f.formatDayRange(a.startDate, a.endDate),
            b: f.formatDayRange(b.startDate, b.endDate),
        }),
    feeRate: ({ a, b }, f, t) =>
        t("compare.details.feeRate", {
            a: f.formatPercent(Number(a.feeRate)),
            b: f.formatPercent(Number(b.feeRate)),
        }),
    benchmarkSymbol: ({ a, b }, _f, t) =>
        t("compare.details.benchmarkSymbol", {
            a: a.benchmarkSymbol ?? t("noBenchmark"),
            b: b.benchmarkSymbol ?? t("noBenchmark"),
        }),
}

// Bandeau affiché quand le backend signale une comparaison non homogène
function HeterogeneityBanner({ comparison }: { comparison: BacktestComparison }) {
    const f = useFormatters()
    const t = useTranslations("backtest")
    const { differences } = comparison
    return (
        <div role="status" className="flex items-start gap-3 rounded-md border bg-muted px-4 py-3.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
                <p className="text-body-semibold">
                    {t("compare.banner.title", {
                        differences: differences.map((d) => t(`compare.differences.${d}`)).join(", "),
                    })}
                </p>
                <p className="text-small text-muted-foreground">
                    {differences.map((d) => differenceDetails[d](comparison, f, t)).join(" ")}{" "}
                    {t("compare.banner.note")}
                </p>
            </div>
        </div>
    )
}

/**
 * Écran de comparaison de deux backtests terminés (maquette 14) : sélection de A et B gardée dans l'URL (`?ids=a,b`),
 * bandeau si la comparaison n'est pas homogène, courbes de valeur et de drawdown, métriques comparées et paramètres.
 * Écarts et homogénéité viennent de `GET /api/backtest/compare` ; `ids` : valeur brute du paramètre de l'URL.
 */
export function BacktestCompare({ ids }: { ids: string | string[] | undefined }) {
    const t = useTranslations("backtest.compare")
    const { errorMessage } = useApiErrorMessages()
    const router = useRouter()
    const parts = String(ids ?? "").split(",")
    // Lien modifié à la main (`?ids=x,x`, trois ids) : traité comme sans sélection, la requête n'étant pas lancée
    const invalidLink = parts.length > 2 || (parts[0] !== "" && parts[0] === parts[1])
    const [a = "", b = ""] = invalidLink ? [] : parts
    const { data: comparison, isPending, isError, error, refetch } = useBacktestComparison(a, b)
    const [copied, setCopied] = useState(false)

    const select = (nextA: string, nextB: string) => {
        setCopied(false)
        router.replace(routes.compareIds(nextA, nextB), { scroll: false })
    }
    const copyLink = () => navigator.clipboard.writeText(window.location.href).then(() => setCopied(true))

    let content
    if (!a || !b) {
        content = <EmptyCard>{invalidLink ? t("invalidLink") : t("choose")}</EmptyCard>
    } else if (isError) {
        content = <ErrorState message={errorMessage(error)} onRetry={refetch} className="h-64" />
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
                title={t("title")}
                description={t("description")}
                actions={
                    <Button variant="outline" onClick={copyLink} disabled={!comparison}>
                        {copied ? t("copied") : t("copy")}
                    </Button>
                }
            />
            <ComparisonSelection a={a} b={b} onChange={select} />
            {content}
        </>
    )
}
