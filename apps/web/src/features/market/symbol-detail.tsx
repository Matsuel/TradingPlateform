import { SymbolCell } from "@/components/data-table/cells"
import { PageHeader } from "@/components/page-layout"
import { PriceChart } from "./price-chart"
import { SymbolSheet } from "./symbol-sheet"

export function SymbolDetail({ symbol }: { symbol: string }) {
    return (
        <>
            <PageHeader leading={<SymbolCell symbol={symbol} size="lg" />} actions={<SymbolSheet symbol={symbol} />} />

            <PriceChart symbol={symbol} />
        </>
    )
}
