import PageLayout from "@/components/page-layout"
import { BacktestDetail } from "@/features/backtest/backtest-detail"

type Props = {
    params: Promise<{ id: string }>
}

const BacktestDetailPage = async ({ params }: Props) => {

    const { id } = await params

    return (
        <PageLayout>
            <BacktestDetail id={id} />
        </PageLayout>
    )
}

export default BacktestDetailPage
