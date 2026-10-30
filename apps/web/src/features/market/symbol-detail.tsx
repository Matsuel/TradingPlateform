import { SymbolCell } from "@/components/data-table/cells"
import PageHeader from "@/components/page-layout/header"
import { PriceChart } from "./price-chart"
import { SymbolSheet } from "./symbol-sheet"

export function SymbolDetail({ symbol }: { symbol: string }) {
    return (
        <>
            <PageHeader
                leading={<SymbolCell symbol={symbol} name={"test"} logoUrl={undefined} size="lg" />}
                actions={<SymbolSheet symbol={symbol} />}
            />

            <PriceChart symbol={symbol} />
        </>
    )
}
