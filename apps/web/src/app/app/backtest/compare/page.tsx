import PageLayout from "@/components/page-layout"
import { BacktestCompare } from "@/features/backtest/backtest-compare"

type Props = {
    searchParams: Promise<{ ids?: string | string[] }>
}

const BacktestComparePage = async ({ searchParams }: Props) => {

    const { ids } = await searchParams

    return (
        <PageLayout>
            <BacktestCompare ids={ids} />
        </PageLayout>
    )
}

export default BacktestComparePage
