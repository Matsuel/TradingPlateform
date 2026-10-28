import { PriceChart } from "@/components/chart"
import { SymbolCell } from "@/components/data-table/cells"
import PageLayout from "@/components/page-layout"
import PageHeader from "@/components/page-layout/header"
import { SymbolSheet } from "@/features/market/symbol-sheet"

type Props = {
    params: Promise<{ symbol: string }>
}

const SymbolPage = async ({ params }: Props) => {

    const { symbol } = await params

    return (
        <PageLayout>
            <PageHeader
                leading={<SymbolCell symbol={symbol} name={"test"} logoUrl={undefined} size="lg" />}
                actions={<SymbolSheet symbol={symbol} />}
            />

            <PriceChart symbol={symbol} />


        </PageLayout>
    )
}

export default SymbolPage
