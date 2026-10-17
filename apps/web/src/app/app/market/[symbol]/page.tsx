import PageLayout from "@/components/PageLayout"

type Props = {
    params: Promise<{ symbol: string }>
}

const SymbolPage = async ({ params }: Props) => {

    const { symbol } = await params


    return (
        <PageLayout
            title="test"
            description="fiejoiz"
        >

            {symbol}

        </PageLayout>
    )
}

export default SymbolPage