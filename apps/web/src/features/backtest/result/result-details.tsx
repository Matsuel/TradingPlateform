"use client"

import { ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useFormatters } from "@/lib/format"
import { BACKTEST_CURRENCY } from "../constants"
import type { BacktestDetails } from "../types"
import { BacktestAssumptions } from "./assumptions"
import { ExecutionList } from "./execution-history"
import { useHoldingColumns } from "./holdings-columns"

function DetailSection({
    title,
    summary,
    defaultOpen,
    children,
}: {
    title: string
    summary: ReactNode
    defaultOpen?: boolean
    children: ReactNode
}) {
    const t = useTranslations("backtest.details")

    return (
        <Collapsible defaultOpen={defaultOpen} className="border-b last:border-b-0">
            <CollapsibleTrigger className="group flex w-full items-center gap-3 py-3.5 text-left">
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-90" />
                <span className="text-body-semibold">{title}</span>
                <span className="min-w-0 flex-1 truncate text-small text-muted-foreground">{summary}</span>
                <span className="text-small font-medium text-muted-foreground group-data-[panel-open]:hidden">
                    {t("show")}
                </span>
                <span className="hidden text-small font-medium text-muted-foreground group-data-[panel-open]:inline">
                    {t("hide")}
                </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-4 pl-7">{children}</CollapsibleContent>
        </Collapsible>
    )
}

/**
 * Sections repliables en bas du détail : positions finales et hypothèses (avec un résultat), puis historique d'exécution.
 * Sans résultat, l'historique est déplié : c'est la seule information disponible.
 */
export function ResultDetails({ backtest }: { backtest: BacktestDetails }) {
    const { formatPrice } = useFormatters()
    const t = useTranslations("backtest.details")
    const holdingColumns = useHoldingColumns()
    const { result, executions } = backtest

    return (
        <Card className="py-2">
            <CardContent>
                {result && (
                    <>
                        <DetailSection
                            title={t("positions")}
                            summary={result.holdings
                                .map((h) => `${h.symbol} ${formatPrice(h.value, BACKTEST_CURRENCY)}`)
                                .join(" · ")}
                        >
                            <DataTable
                                rows={result.holdings}
                                columns={holdingColumns}
                                rowKey={(h) => h.symbol}
                                emptyMessage={t("positionsEmpty")}
                            />
                        </DetailSection>
                        <DetailSection title={t("assumptions")} summary={t("assumptionsSummary")}>
                            <BacktestAssumptions backtest={backtest} result={result} />
                        </DetailSection>
                    </>
                )}
                <DetailSection
                    title={t("history")}
                    summary={t("historyCount", { count: executions.length })}
                    defaultOpen={!result}
                >
                    <ExecutionList executions={executions} />
                </DetailSection>
            </CardContent>
        </Card>
    )
}
