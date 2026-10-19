import { PriceChart } from "@/components/chart"
import { SymbolCell } from "@/components/data-table/cells"
import PageLayout from "@/components/page-layout"

type Props = {
    params: Promise<{ symbol: string }>
}

const SymbolPage = async ({ params }: Props) => {

    const { symbol } = await params

    return (
        <PageLayout>
            <SymbolCell symbol={symbol} name={"test"} logoUrl={undefined} size="lg" />

            <PriceChart symbol={symbol} />

        </PageLayout>
    )
}

export default SymbolPage