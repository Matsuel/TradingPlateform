import type { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { SymbolDetail } from "@/features/market/symbol-detail"

export async function generateMetadata({ params }: PageProps<"/app/market/[symbol]">): Promise<Metadata> {
    const { symbol } = await params
    return { title: decodeURIComponent(symbol) }
}

export default async function SymbolPage({ params }: PageProps<"/app/market/[symbol]">) {
    const { symbol } = await params
    return (
        <PageLayout>
            <SymbolDetail symbol={decodeURIComponent(symbol)} />
        </PageLayout>
    )
}
