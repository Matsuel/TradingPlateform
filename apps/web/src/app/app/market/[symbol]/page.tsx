import PageLayout from "@/components/page-layout"
import { SymbolDetail } from "@/features/market/symbol-detail"

type Props = {
    params: Promise<{ symbol: string }>
}

const SymbolPage = async ({ params }: Props) => {

    const { symbol } = await params

    return (
        <PageLayout>
            <SymbolDetail symbol={symbol} />
        </PageLayout>
    )
}

export default SymbolPage
