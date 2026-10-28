import Link from 'next/link'
import PageLayout from '@/components/page-layout'
import PageHeader from '@/components/page-layout/header'
import { Button } from '@/components/ui/button'
import { BacktestList } from '@/features/backtest/backtest-list'
import { prefix } from '@/lib/path'

const BacktestPage = () => {
    return (
        <PageLayout>
            <PageHeader
                title='Backtests'
                description='Historique des runs de stratégies exécutés.'
                actions={<Button nativeButton={false} render={<Link href={`${prefix}/backtest/new`} />}>Nouveau backtest</Button>}
            />
            <BacktestList />
        </PageLayout>
    )
}

export default BacktestPage
